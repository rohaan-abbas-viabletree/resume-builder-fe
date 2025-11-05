"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Divider, Switch } from "antd";
import { useRouter, useParams } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import FormInput from "@/components/FormInput/FormInput";
import LabelComponent from "@/components/LabelComponent/LabelComponent";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import { FIELD_TYPE } from "@/static/constants";
import { openNotification } from "@/lib/utils/utils";
import { useGetResumeByIdQuery } from "@/graphql/resume/resume.generated";
import {
  useCreateResumeMutation,
  useUpdateResumeMutation,
} from "@/graphql/resume/resume.mutation.generated";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

// 👇 Load PDFViewer client-only to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false },
);

/* -------------------------- Utils -------------------------- */

const stripHtml = (html?: string) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const isDJ = (v: any): v is Dayjs =>
  typeof v === "object" &&
  v &&
  typeof v.isValid === "function" &&
  typeof v.format === "function";

const normalizeNullsDeep = (input: unknown): any => {
  if (isDJ(input) || input instanceof Date) return input;
  if (input === null) return undefined;

  if (Array.isArray(input)) {
    return input.map((v) => (v === null ? undefined : normalizeNullsDeep(v)));
  }

  if (typeof input === "object" && input) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = isDJ(v) || v instanceof Date ? v : normalizeNullsDeep(v);
    }
    return out;
  }

  return input;
};

// ✅ Safe date formatter (accepts string/number/Date/dayjs)
const fmtDate = (v: any, fmt = "YYYY-MM-DD"): string => {
  if (!v) return "";
  if (isDJ(v)) return v.isValid() ? v.format(fmt) : "";
  const primitive =
    typeof v === "string" || typeof v === "number" || v instanceof Date;
  if (!primitive) return "";
  const d = dayjs(v as any);
  return d.isValid() ? d.format(fmt) : "";
};

// ---- Config: set true if Strapi has start_date/end_date fields ----
const BACKEND_HAS_DATE_RANGE = true; // set false if backend only has single "date"

// Build a pair from either (start/end) or from a single 'date'
const toPair = (start?: any, end?: any, single?: any) => {
  const s = start ?? single;
  return {
    start: s ? dayjs(s) : undefined,
    end: end ? dayjs(end) : undefined,
  };
};

// API -> RangePicker value from either {start_date,end_date} or {date}
const toRangeValue = (
  start?: any,
  end?: any,
  single?: any,
): [Dayjs | undefined, Dayjs | undefined] | undefined => {
  const { start: s, end: e } = toPair(start, end, single);
  const sv = s && s.isValid() ? s : undefined;
  const ev = e && e.isValid() ? e : undefined;
  if (!sv && !ev) return undefined;
  return [sv, ev];
};

// RangePicker or single Date -> { start_date, end_date }
const serializeRangeToPair = (
  v: any,
): { start_date?: string; end_date?: string } => {
  if (!v) return {};
  if (Array.isArray(v)) {
    const start_date = fmtDate(v[0]) || undefined;
    const end_date = fmtDate(v[1]) || undefined;
    return { start_date, end_date };
  }
  const d = fmtDate(v);
  return d ? { start_date: d, end_date: undefined } : {};
};

/* -------------------------- UI Types -------------------------- */

type UiResume = {
  documentId?: string;
  resume_ref_id?: string;
  name?: string;
  designation?: string;
  introduction?: string;

  education?: Array<{
    id?: string;
    education_name?: string;
    education_info?: string;
    date?: [Dayjs | undefined, Dayjs | undefined] | Dayjs | undefined; // UI (range or single)
    start_date?: string | null; // API
    end_date?: string | null; // API
    is_current?: boolean; // API
  }>;

  work_history?: Array<{
    id?: string;
    designation?: string;
    location?: string;
    description?: string;
    date?: [Dayjs | undefined, Dayjs | undefined] | Dayjs | undefined; // UI
    start_date?: string | null; // API
    end_date?: string | null; // API
    list?: Array<{ description?: string }>;
    is_current?: boolean; // API
  }>;

  languages?: Array<{
    name?: string;
    level_name?: string;
    level?: string;
  }>;

  major_projects?: Array<{
    name?: string;
    project_info?: string;
    description?: string;
    project_list?: Array<{ description?: string }>;
  }>;

  skills?: Array<{
    skill_level?: string;
    skill_name?: string;
  }>;
};

/* -------------------------- PDF Styles -------------------------- */

const toTime = (v: any): number => {
  const d = dayjs(v);
  return d.isValid() ? d.valueOf() : Number.NEGATIVE_INFINITY;
};

const eduSortDesc = (a: any, b: any) => {
  // Treat current as "now"
  const aEnd = a?.is_current ? Date.now() : toTime(a?.end_date);
  const bEnd = b?.is_current ? Date.now() : toTime(b?.end_date);
  if (aEnd !== bEnd) return bEnd - aEnd;

  const aStart = toTime(a?.start_date);
  const bStart = toTime(b?.start_date);
  if (aStart !== bStart) return bStart - aStart;

  return 0;
};

const yearRange = (start?: any, end?: any, isCurrent?: boolean): string => {
  const sy = fmtDate(start, "YYYY");
  if (isCurrent) return sy ? `${sy}-Present` : "Present";
  const ey = fmtDate(end, "YYYY");
  return sy && ey ? `${sy}-${ey}` : sy || ey || "";
};

/* -------------------------- PDF Component -------------------------- */
/* -------------------------- PDF Styles -------------------------- */

// (Optional) Use core fonts; no external files needed
// Helvetica/Helvetica-Bold render well in @react-pdf
Font.registerHyphenationCallback((word) => [word]); // avoid weird hyphenation

const COLOR_TEXT = "#0f172a"; // slate-900
const COLOR_MUTED = "#6b7280"; // gray-500
const COLOR_DIVIDER = "#e5e7eb"; // gray-200
const COLOR_ACCENT = "#1f2a44"; // deep slate
const COLOR_BAR_BG = "#e5e7eb";
const COLOR_BAR_FG = "#1e293b"; // slate-800

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10.5,
    color: COLOR_TEXT,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },

  // Header
  ref_id: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLOR_ACCENT,
    letterSpacing: 0.2,
  },
  designation: {
    fontSize: 11.5,
    marginTop: 10,
    color: COLOR_ACCENT,
  },

  // Section framing
  section: {
    paddingTop: 12,
    paddingBottom: 10,
    borderTop: `1 solid ${COLOR_DIVIDER}`,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR_ACCENT,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // Text styles
  paragraph: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 1.55,
    color: COLOR_TEXT,
  },
  label: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR_TEXT,
  },
  meta: {
    fontSize: 10,
    color: COLOR_MUTED,
    marginTop: 1,
  },
  bullet: {
    marginLeft: 10,
    marginTop: 2,
    fontSize: 10.2,
  },

  // Layout helpers
  rowItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  colLeft: { width: "30%", paddingRight: 8 },
  colRight: { width: "70%" },

  // Bars (skills/language)
  barWrap: {
    marginTop: 3,
    width: "100%",
    height: 6.5,
    backgroundColor: COLOR_BAR_BG,
    borderRadius: 3.5,
  },
  barFill: {
    height: "100%",
    backgroundColor: COLOR_BAR_FG,
    borderRadius: 3.5,
  },

  // Minor spacers
  itemGap: { marginBottom: 6 },
});

/* -------------------------- Helper: Section -------------------------- */

const Section = ({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    {children}
  </View>
);

/* -------------------------- PDF Component -------------------------- */

const ResumePDF = ({ data }: { data: UiResume }) => {
  const skills = data?.skills || [];
  const work = data?.work_history || [];
  const edu = data?.education || [];
  const langs = data?.languages || [];
  const projects = data?.major_projects || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.ref_id}>{data?.resume_ref_id || ""}</Text>
          {data?.designation ? (
            <Text style={styles.designation}>{data.designation}</Text>
          ) : null}
        </View>

        {/* Introduction */}
        {data?.introduction ? (
          <Section>
            <Text style={styles.paragraph}>{stripHtml(data.introduction)}</Text>
          </Section>
        ) : null}

        {/* Skills */}
        {skills.length > 0 ? (
          <Section title="Skills">
            {skills.map((s, i) => {
              const level = Math.min(
                100,
                Math.max(0, Number(s?.skill_level) || 0),
              );
              return (
                <View key={i} style={styles.itemGap}>
                  <Text style={styles.paragraph}>{s?.skill_name || "-"}</Text>
                  <View style={styles.barWrap}>
                    <View style={{ ...styles.barFill, width: `${level}%` }} />
                  </View>
                </View>
              );
            })}
          </Section>
        ) : null}

        {/* Work Experience */}
        {work.length > 0 ? (
          <Section title="Work Experience">
            {[...work]
              .sort((a, b) => {
                const aEnd = a?.is_current ? Date.now() : toTime(a?.end_date);
                const bEnd = b?.is_current ? Date.now() : toTime(b?.end_date);
                if (aEnd !== bEnd) return bEnd - aEnd;
                return toTime(b?.start_date) - toTime(a?.start_date);
              })
              .map((w, i) => {
                const start = fmtDate(w?.start_date, "YYYY-MM") || "";
                const end = w?.is_current
                  ? "Current"
                  : fmtDate(w?.end_date, "YYYY-MM") || "";
                return (
                  <View key={i} style={styles.rowItem}>
                    {/* LEFT: date range */}
                    <View style={styles.colLeft}>
                      <Text style={styles.meta}>
                        {start} {start && "–"} {end}
                      </Text>
                    </View>

                    {/* RIGHT: role details */}
                    <View style={styles.colRight}>
                      <Text style={styles.label}>
                        {w?.designation || "Designation"}
                      </Text>
                      {w?.location ? (
                        <Text style={styles.meta}>{w.location}</Text>
                      ) : null}
                      {w?.description ? (
                        <Text style={styles.paragraph}>
                          {stripHtml(w.description)}
                        </Text>
                      ) : null}
                      {Array.isArray(w?.list) &&
                        w.list.map((li, idx) =>
                          li?.description ? (
                            <Text key={idx} style={styles.bullet}>
                              • {stripHtml(li.description)}
                            </Text>
                          ) : null,
                        )}
                    </View>
                  </View>
                );
              })}
          </Section>
        ) : null}

        {/* Major Projects */}
        {projects.length > 0 ? (
          <Section title="Major Projects">
            {projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.label}>{p?.name || "—"}</Text>
                {p?.project_info ? (
                  <Text style={styles.paragraph}>
                    {stripHtml(p.project_info)}
                  </Text>
                ) : null}
                {p?.description ? (
                  <Text style={styles.paragraph}>
                    {stripHtml(p.description)}
                  </Text>
                ) : null}
                {p?.project_list?.length ? (
                  <View style={{ marginTop: 2 }}>
                    {p.project_list!.map((li, idx) =>
                      li?.description ? (
                        <Text key={idx} style={styles.bullet}>
                          • {stripHtml(li.description)}
                        </Text>
                      ) : null,
                    )}
                  </View>
                ) : null}
              </View>
            ))}
          </Section>
        ) : null}

        {/* Education */}
        {edu.length > 0 ? (
          <Section title="Education">
            {[...edu].sort(eduSortDesc).map((e, i) => (
              <View key={i} style={styles.rowItem}>
                {/* LEFT: years */}
                <View style={styles.colLeft}>
                  <Text style={styles.meta}>
                    {yearRange(e?.start_date, e?.end_date, e?.is_current)}
                  </Text>
                </View>

                {/* RIGHT: details */}
                <View style={styles.colRight}>
                  <Text style={styles.label}>{e?.education_name || "—"}</Text>
                  {e?.education_info ? (
                    <Text style={styles.paragraph}>
                      {stripHtml(e.education_info)}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Section>
        ) : null}

        {/* Languages */}
        {langs.length > 0 ? (
          <Section title="Languages">
            {langs.map((l, i) => {
              const level = Math.min(100, Math.max(0, Number(l?.level) || 0));
              const levelText = l?.level_name || "";
              return (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={styles.paragraph}>{l?.name}</Text>
                  <View style={styles.barWrap}>
                    <View style={{ ...styles.barFill, width: `${level}%` }} />
                  </View>
                  {levelText ? (
                    <Text
                      style={{
                        ...styles.meta,
                        textAlign: "right",
                        marginTop: 2,
                      }}>
                      {levelText}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Section>
        ) : null}
      </Page>
    </Document>
  );
};

/* ------------------------------ Page ------------------------------ */

export default function AddEditResume() {
  const router = useRouter();
  const params = useParams();
  const resumeId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string) || "";

  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<UiResume>({});
  const rafRef = useRef<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch for edit mode
  const { data } = useGetResumeByIdQuery(
    { documentId: resumeId },
    { enabled: !!resumeId },
  );

  // API -> UI (build Date/Range values)
  useEffect(() => {
    if (!data?.resume) return;

    const ui = normalizeNullsDeep(data.resume) as UiResume;

    const uiForForm: UiResume = {
      ...ui,
      education: ui.education?.map((e) => ({
        ...e,
        date: toRangeValue(e?.start_date, e?.end_date, (e as any)?.date),
      })),
      work_history: ui.work_history?.map((w) => ({
        ...w,
        date: toRangeValue(w?.start_date, w?.end_date, (w as any)?.date),
      })),
    };

    form.setFieldsValue(uiForForm as any);
    setPreviewData(uiForForm);

    console.groupCollapsed(
      "%c[useEffect] Loaded resume → uiForForm",
      "color:#2f3f63",
    );
    console.log("work_history:", uiForForm.work_history);
    console.log("education:", uiForForm.education);
    console.groupEnd();
  }, [data, form]);

  const { mutateAsync: createResume, isLoading: creating } =
    useCreateResumeMutation({
      onSuccess: (res) => {
        openNotification("Resume created successfully!");
        const newId = res?.createResume?.documentId;
        if (newId) router.push(`/resume/${newId}`);
      },
    });

  const { mutateAsync: updateResume, isLoading: updating } =
    useUpdateResumeMutation({
      onSuccess: () => openNotification("Resume updated successfully!"),
    });

  // Debounced live preview
  const onFormValuesChange = (_changed: any, allValues: any) => {
    console.groupCollapsed("%c[onValuesChange] Triggered", "color:#8a2be2");
    const newData = normalizeNullsDeep(allValues) as UiResume;

    const prevWork = previewData.work_history || [];
    const prevEdu = previewData.education || [];

    // ---- Work History ----
    newData.work_history = newData.work_history?.map((item, index) => {
      const old = prevWork[index];
      const next = { ...item };

      if (Array.isArray(item?.date) && (item.date[0] || item.date[1])) {
        const { start_date, end_date } = serializeRangeToPair(item.date);
        next.start_date = start_date;
        next.end_date = end_date;
      } else {
        // single date or untouched → preserve previous if any
        const { start_date } = serializeRangeToPair(item?.date);
        next.start_date =
          start_date ?? old?.start_date ?? item?.start_date ?? null;
        next.end_date = old?.end_date ?? item?.end_date ?? null;
      }

      // If marked current, drop end_date
      if (next?.is_current) next.end_date = null;

      return next;
    });

    // ---- Education ----
    newData.education = newData.education?.map((item, index) => {
      const old = prevEdu[index];
      const next = { ...item };

      if (Array.isArray(item?.date) && (item.date[0] || item.date[1])) {
        const { start_date, end_date } = serializeRangeToPair(item.date);
        next.start_date = start_date;
        next.end_date = end_date;
      } else {
        const { start_date } = serializeRangeToPair(item?.date);
        next.start_date =
          start_date ?? old?.start_date ?? item?.start_date ?? null;
        next.end_date = old?.end_date ?? item?.end_date ?? null;
      }

      if (next?.is_current) next.end_date = null;

      return next;
    });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setPreviewData(newData));
      console.groupEnd();
    }, 150);
  };

  const handleSave = async () => {
    // Validate only the required reference id
    try {
      // Force-trim value before validating
      const ridRaw = form.getFieldValue("resume_ref_id");
      if (typeof ridRaw === "string") {
        form.setFieldsValue({ resume_ref_id: ridRaw.trim() });
      }
      await form.validateFields(["resume_ref_id"]);
    } catch {
      openNotification("Please provide the Resume Reference ID.", "error");
      return;
    }

    const values = form.getFieldsValue();

    // Double guard (in case someone bypasses UI)
    if (!values?.resume_ref_id || !String(values.resume_ref_id).trim()) {
      openNotification("Resume Reference ID is required.");
      return;
    }

    // Build normalized arrays first so we can branch payloads cleanly
    const eduNormalized = values.education?.map((e: any) => {
      const { start_date, end_date } = serializeRangeToPair(e?.date);
      return {
        id: e?.id,
        education_name: e?.education_name,
        education_info: e?.education_info,
        is_current: !!e?.is_current,
        start_date,
        end_date: e?.is_current ? null : end_date,
        date: start_date || null, // for legacy single-date backends
      };
    });

    const workNormalized = values.work_history?.map((w: any) => {
      const { start_date, end_date } = serializeRangeToPair(w?.date);
      return {
        id: w?.id,
        designation: w?.designation,
        location: w?.location,
        description: w?.description,
        list: w?.list?.map((li: any) => ({ description: li?.description })),
        is_current: !!w?.is_current,
        start_date,
        end_date: w?.is_current ? null : end_date,
        date: start_date || null,
      };
    });

    const educationPayload = BACKEND_HAS_DATE_RANGE
      ? eduNormalized?.map(({ date, ...rest }: any) => rest)
      : eduNormalized?.map(({ start_date, end_date, ...rest }: any) => rest);

    const workPayload = BACKEND_HAS_DATE_RANGE
      ? workNormalized?.map(({ date, ...rest }: any) => rest)
      : workNormalized?.map(({ start_date, end_date, ...rest }: any) => rest);

    const payload = normalizeNullsDeep({
      resume_ref_id: String(values.resume_ref_id).trim(),
      name: values.name,
      designation: values.designation,
      introduction: values.introduction,

      skills: values.skills?.map((s: any) => ({
        skill_name: s?.skill_name,
        skill_level: s?.skill_level,
      })),

      education: educationPayload,

      languages: values.languages?.map((l: any) => ({
        name: l?.name,
        level_name: l?.level_name,
        level: l?.level,
      })),

      major_projects: values.major_projects?.map((p: any) => ({
        name: p?.name,
        project_info: p?.project_info,
        description: p?.description,
        project_list: p?.project_list?.map((li: any) => ({
          description: li?.description,
        })),
      })),

      work_history: workPayload,
    });

    if (resumeId) {
      await updateResume({ documentId: resumeId, data: payload });
    } else {
      await createResume({ data: payload });
    }
  };

  const pdfElement = useMemo(
    () => <ResumePDF data={previewData} />,
    [previewData],
  );

  const handleDownloadPDF = async () => {
    const blob = await pdf(pdfElement).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {resumeId ? "Edit Resume" : "Create Resume"}
      </h1>
      <ButtonComponent
        text="Back to listing"
        onClick={() => router.push("/")}
      />
      <Row gutter={32}>
        {/* LEFT: FORM */}
        <Col span={12}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={onFormValuesChange}>
            <Divider orientation="left">Personal Details</Divider>

            <LabelComponent text="Resume Reference ID" />
            <FormInput
              fieldName="resume_ref_id"
              type={FIELD_TYPE.text}
              rules={[{ required: true }]}
            />

            <LabelComponent text="Full Name" required={false} />
            <FormInput fieldName="name" type={FIELD_TYPE.text} />

            <LabelComponent text="Designation" required={false} />
            <FormInput fieldName="designation" type={FIELD_TYPE.text} />

            <LabelComponent text="Introduction" required={false} />
            <FormInput fieldName="introduction" type={FIELD_TYPE.textArea} />

            {/* Skills */}
            <Divider orientation="left">Skills</Divider>
            <Form.List name="skills">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={12} className="mb-2">
                      <Col span={12}>
                        <FormInput
                          fieldName={[name, "skill_name"]}
                          type={FIELD_TYPE.text}
                          placeholder="e.g. React"
                        />
                      </Col>
                      <Col span={10}>
                        <FormInput
                          fieldName={[name, "skill_level"]}
                          type={FIELD_TYPE.number}
                          placeholder="0 - 100"
                          rules={[
                            {
                              type: "number",
                              min: 0,
                              max: 100,
                              message: "0-100 allowed",
                            },
                          ]}
                        />
                      </Col>
                      <Col span={2}>
                        <ButtonComponent
                          text="-"
                          btnCustomType="outline"
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <ButtonComponent
                    text="Add Skill"
                    btnCustomType="inner-primary"
                    onClick={() => add()}
                  />
                </>
              )}
            </Form.List>

            {/* Work History */}
            <Divider orientation="left">Work History</Divider>
            <Form.List name="work_history">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }, index) => {
                    const isLast = index === fields.length - 1;

                    return (
                      <div
                        key={key}
                        className="mb-4 p-3 border rounded-md bg-gray-50">
                        {/* Top bar with Current toggle only for LAST item */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-600">
                            Work #{index + 1}
                          </div>
                          {isLast && (
                            <Form.Item
                              name={[name, "is_current"]}
                              valuePropName="checked"
                              className="mb-0">
                              <Switch
                                size="small"
                                checkedChildren="Current"
                                unCheckedChildren="Past"
                              />
                            </Form.Item>
                          )}
                        </div>

                        {/* Date + fields */}
                        <Row gutter={12}>
                          {/* Date input: single when current, range when past */}
                          <Col span={12}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(p, c) =>
                                p.work_history?.[index]?.is_current !==
                                c.work_history?.[index]?.is_current
                              }>
                              {({ getFieldValue }) => {
                                const cur = !!getFieldValue([
                                  "work_history",
                                  index,
                                  "is_current",
                                ]);
                                return cur ? (
                                  <FormInput
                                    fieldName={[name, "date"]}
                                    type={FIELD_TYPE.date}
                                    placeholder="Start"
                                  />
                                ) : (
                                  <FormInput
                                    fieldName={[name, "date"]}
                                    type={FIELD_TYPE.dateRange}
                                    placeholder={["Start", "End"]}
                                  />
                                );
                              }}
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <FormInput
                              fieldName={[name, "designation"]}
                              type={FIELD_TYPE.text}
                              placeholder="Role / Title"
                            />
                          </Col>
                          <Col span={12}>
                            <FormInput
                              fieldName={[name, "location"]}
                              type={FIELD_TYPE.text}
                              placeholder="City, Country"
                            />
                          </Col>
                          <Col span={24}>
                            <FormInput
                              fieldName={[name, "description"]}
                              type={FIELD_TYPE.textArea}
                              placeholder="Summary of responsibilities/impact"
                            />
                          </Col>

                          <Col span={24}>
                            <LabelComponent text="Highlights (bullets)" />
                            <Form.List name={[name, "list"]}>
                              {(f2, { add: add2, remove: remove2 }) => (
                                <>
                                  {f2.map(({ key: k2, name: n2 }) => (
                                    <Row key={k2} gutter={8} className="mb-2">
                                      <Col span={22}>
                                        <FormInput
                                          fieldName={[n2, "description"]}
                                          type={FIELD_TYPE.text}
                                          placeholder="Achievement / task"
                                        />
                                      </Col>
                                      <Col span={2}>
                                        <ButtonComponent
                                          text="-"
                                          btnCustomType="outline"
                                          onClick={() => remove2(n2)}
                                        />
                                      </Col>
                                    </Row>
                                  ))}
                                  <ButtonComponent
                                    text="Add Highlight"
                                    btnCustomType="inner-primary"
                                    onClick={() => add2()}
                                  />
                                </>
                              )}
                            </Form.List>
                          </Col>
                        </Row>

                        <div className="mt-2">
                          <ButtonComponent
                            text="Remove"
                            btnCustomType="outline"
                            onClick={() => remove(name)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <ButtonComponent
                    text="Add Work"
                    btnCustomType="inner-primary"
                    onClick={() => add()}
                  />
                </>
              )}
            </Form.List>

            {/* Major Projects */}
            <Divider orientation="left">Major Projects</Divider>
            <Form.List name="major_projects">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="mb-4 p-3 border rounded-md bg-gray-50">
                      <Row gutter={12}>
                        <Col span={24}>
                          <FormInput
                            fieldName={[name, "name"]}
                            type={FIELD_TYPE.text}
                            placeholder="Project name"
                          />
                        </Col>
                        <Col span={24}>
                          <FormInput
                            fieldName={[name, "description"]}
                            type={FIELD_TYPE.textArea}
                            placeholder="Detailed description"
                          />
                        </Col>
                        <Col span={24}>
                          <LabelComponent text="Bulleted List" />
                          <Form.List name={[name, "project_list"]}>
                            {(f2, { add: add2, remove: remove2 }) => (
                              <>
                                {f2.map(({ key: k2, name: n2 }) => (
                                  <Row key={k2} gutter={8} className="mb-2">
                                    <Col span={22}>
                                      <FormInput
                                        fieldName={[n2, "description"]}
                                        type={FIELD_TYPE.text}
                                        placeholder="Bullet item"
                                      />
                                    </Col>
                                    <Col span={2}>
                                      <ButtonComponent
                                        text="-"
                                        btnCustomType="outline"
                                        onClick={() => remove2(n2)}
                                      />
                                    </Col>
                                  </Row>
                                ))}
                                <ButtonComponent
                                  text="Add Item"
                                  btnCustomType="inner-primary"
                                  onClick={() => add2()}
                                />
                              </>
                            )}
                          </Form.List>
                        </Col>
                      </Row>
                      <div className="mt-2">
                        <ButtonComponent
                          text="Remove"
                          btnCustomType="outline"
                          onClick={() => remove(name)}
                        />
                      </div>
                    </div>
                  ))}
                  <ButtonComponent
                    text="Add Project"
                    btnCustomType="inner-primary"
                    onClick={() => add()}
                  />
                </>
              )}
            </Form.List>

            {/* Education */}
            <Divider orientation="left">Education</Divider>
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }, index) => {
                    const isLast = index === fields.length - 1;

                    return (
                      <div
                        key={key}
                        className="mb-4 p-3 border rounded-md bg-gray-50">
                        {/* Top bar with Current toggle only for LAST item */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-600">
                            Education #{index + 1}
                          </div>
                          {isLast && (
                            <Form.Item
                              name={[name, "is_current"]}
                              valuePropName="checked"
                              className="mb-0">
                              <Switch
                                size="small"
                                checkedChildren="Current"
                                unCheckedChildren="Past"
                              />
                            </Form.Item>
                          )}
                        </div>

                        <Row gutter={12}>
                          <Col span={12}>
                            <FormInput
                              fieldName={[name, "education_name"]}
                              type={FIELD_TYPE.text}
                              placeholder="Degree / Program"
                            />
                          </Col>

                          {/* Date input: single when current, range when past */}
                          <Col span={12}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(p, c) =>
                                p.education?.[index]?.is_current !==
                                c.education?.[index]?.is_current
                              }>
                              {({ getFieldValue }) => {
                                const cur = !!getFieldValue([
                                  "education",
                                  index,
                                  "is_current",
                                ]);
                                return cur ? (
                                  <FormInput
                                    fieldName={[name, "date"]}
                                    type={FIELD_TYPE.date}
                                    placeholder="Start"
                                  />
                                ) : (
                                  <FormInput
                                    fieldName={[name, "date"]}
                                    type={FIELD_TYPE.dateRange}
                                    placeholder={["Start", "End"]}
                                  />
                                );
                              }}
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <FormInput
                              fieldName={[name, "education_info"]}
                              type={FIELD_TYPE.textArea}
                              placeholder="Details, institute, GPA, etc."
                            />
                          </Col>
                        </Row>

                        <div className="mt-2">
                          <ButtonComponent
                            text="Remove"
                            btnCustomType="outline"
                            onClick={() => remove(name)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <ButtonComponent
                    text="Add Education"
                    btnCustomType="inner-primary"
                    onClick={() => add()}
                  />
                </>
              )}
            </Form.List>

            {/* Languages */}
            <Divider orientation="left">Languages</Divider>
            <Form.List name="languages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={12} className="mb-2">
                      <Col span={10}>
                        <FormInput
                          fieldName={[name, "name"]}
                          type={FIELD_TYPE.text}
                          placeholder="Language"
                        />
                      </Col>
                      <Col span={7}>
                        <FormInput
                          fieldName={[name, "level_name"]}
                          type={FIELD_TYPE.text}
                          placeholder="e.g. Fluent"
                        />
                      </Col>
                      <Col span={5}>
                        <FormInput
                          fieldName={[name, "level"]}
                          type={FIELD_TYPE.number}
                          placeholder="0 - 100"
                          rules={[
                            {
                              type: "number",
                              min: 0,
                              max: 100,
                              message: "0-100 allowed",
                            },
                          ]}
                        />
                      </Col>
                      <Col span={2}>
                        <ButtonComponent
                          text="-"
                          btnCustomType="outline"
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <ButtonComponent
                    text="Add Language"
                    btnCustomType="inner-primary"
                    onClick={() => add()}
                  />
                </>
              )}
            </Form.List>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <ButtonComponent
                text={resumeId ? "Update" : "Save"}
                loading={creating || updating}
                btnCustomType="inner-primary"
                onClick={handleSave}
              />
              <ButtonComponent
                text="Download PDF"
                btnCustomType="outline"
                onClick={handleDownloadPDF}
              />
            </div>
          </Form>
        </Col>

        {/* RIGHT: PDF PREVIEW */}
        <Col span={12} className="sticky top-0 h-full">
          <div className="border bg-white shadow-md rounded-md">
            <PDFViewer style={{ width: "100%", height: 900 }}>
              <ResumePDF data={previewData} />
            </PDFViewer>
          </div>
        </Col>
      </Row>
    </div>
  );
}
