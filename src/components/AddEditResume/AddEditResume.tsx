"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Row, Col, Divider } from "antd";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
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
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

/* -------------------------- Utils -------------------------- */

const stripHtml = (html?: string) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const normalizeNullsDeep = (input: unknown): any => {
  if (input === null) return undefined;
  if (Array.isArray(input)) {
    return input.filter((v) => v != null).map((v) => normalizeNullsDeep(v));
  }
  if (typeof input === "object" && input) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) out[k] = normalizeNullsDeep(v);
    return out;
  }
  return input;
};

const isDJ = (v: any) =>
  typeof v === "object" &&
  v &&
  typeof v.isValid === "function" &&
  typeof v.format === "function";

const fmtDate = (v: any, fmt = "YYYY-MM-DD"): string => {
  if (!v) return "";
  if (isDJ(v)) return v.isValid() ? v.format(fmt) : "";
  const d = dayjs(v as any);
  return d.isValid() ? d.format(fmt) : "";
};

// Display helper: "Nov 2025 – Present"
const dateRangeLabel = (start?: any, end?: any): string => {
  const s = fmtDate(start, "MMM YYYY");
  const e = fmtDate(end, "MMM YYYY");
  if (s && e) return `${s} – ${e}`;
  if (s && !e) return `${s} – Present`;
  return s || e || "";
};

// API -> RangePicker value
const toRangeValue = (
  start?: any,
  end?: any,
): [any | undefined, any | undefined] | undefined => {
  const s = start ? dayjs(start) : undefined;
  const e = end ? dayjs(end) : undefined;
  const sv = s && s.isValid() ? s : undefined;
  const ev = e && e.isValid() ? e : undefined;
  if (!sv && !ev) return undefined;
  return [sv, ev];
};

// RangePicker -> { start_date, end_date }
const serializeRangeToPair = (
  v: any,
): { start_date?: string; end_date?: string } => {
  if (!v) return {};
  // antd RangePicker returns [dayjs|undefined, dayjs|undefined]
  if (Array.isArray(v)) {
    const start_date = fmtDate(v[0]) || undefined;
    const end_date = fmtDate(v[1]) || undefined;
    return { start_date, end_date };
  }
  // if someone passes single dayjs/date/string by mistake
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
    // form-only field:
    date?: [any | undefined, any | undefined];
    // fetched/saved:
    start_date?: string | null;
    end_date?: string | null;
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

  work_history?: Array<{
    // form-only:
    date?: [any | undefined, any | undefined];
    // fetched/saved:
    start_date?: string | null;
    end_date?: string | null;

    designation?: string;
    location?: string;
    description?: string;
    list?: Array<{ description?: string }>;
  }>;
};

/* -------------------------- PDF Styles -------------------------- */

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#111" },
  //   header: { borderBottom: "1 solid #eee", paddingBottom: 10, marginBottom: 14 },
  name: { fontSize: 22, fontWeight: 700 },
  ref_id: { fontSize: 26, fontWeight: 500, color: "#191970" },
  designation: { fontSize: 12, marginTop: 4, color: "#191970" },

  section: { marginTop: 14, borderBottom: "1 solid #eee", paddingTop: 8 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#191970" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
    color: "#191970",
  },

  row: { marginBottom: 8 },
  label: { fontSize: 12, fontWeight: 600 },
  meta: { fontSize: 10, color: "#666", marginTop: 2 },
  paragraph: { marginTop: 4, lineHeight: 1.4, color: "#191970" },
  bullet: { marginLeft: 10, marginTop: 2 },
});

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
          {/* <Text style={styles.name}>{data?.name || "Your Name"}</Text> */}
          <Text style={styles.ref_id}>{data?.resume_ref_id}</Text>
          {data?.designation ? (
            <Text style={styles.designation}>{data.designation}</Text>
          ) : null}
        </View>

        {/* Introduction */}
        {data?.introduction ? (
          <View style={styles.section}>
            <Text style={styles.paragraph}>{stripHtml(data.introduction)}</Text>
          </View>
        ) : null}

        {/* Skills */}
        {skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((s, i) => {
              const level = Number(s?.skill_level) || 0; // 0–100

              return (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={styles.paragraph}>{s?.skill_name || "-"}</Text>

                  {/* ✅ Progress bar */}
                  <View
                    style={{
                      marginTop: 2,
                      width: "100%",
                      height: 10,
                      backgroundColor: "#d9d9d9",
                      borderRadius: 3,
                    }}>
                    <View
                      style={{
                        width: `${level}%`,
                        height: "100%",
                        backgroundColor: "#2f3f63", // Dark blue
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Education */}
        {edu.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {edu.map((e, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{e?.education_name || "—"}</Text>
                {e?.start_date || e?.end_date ? (
                  <Text style={styles.meta}>
                    {dateRangeLabel(e?.start_date, e?.end_date)}
                  </Text>
                ) : null}
                {e?.education_info ? (
                  <Text style={styles.paragraph}>
                    {stripHtml(e.education_info)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {langs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {langs.map((l, i) => {
              const level = Number(l?.level) || 0; // 0 - 100 %
              const levelText = l?.level_name || ""; // e.g. Professional Working

              return (
                <View key={i} style={{ marginBottom: 10 }}>
                  {/* Language Name */}
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    {l?.name}
                  </Text>

                  {/* Progress Bar */}
                  <View
                    style={{
                      marginTop: 3,
                      width: "100%",
                      height: 10,
                      backgroundColor: "#dcdcdc", // light grey
                      borderRadius: 3,
                      position: "relative",
                    }}>
                    <View
                      style={{
                        width: `${level}%`,
                        height: "100%",
                        backgroundColor: "#2f3f63", // dark blue
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  {/* Level Name under bar (right aligned) */}
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#444",
                      textAlign: "right",
                      marginTop: 2,
                    }}>
                    {levelText}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Major Projects */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Major Projects</Text>
            {projects.map((p, i) => (
              <View key={i} style={styles.row}>
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
                  <View style={{ marginTop: 4 }}>
                    {p.project_list!.map((li, idx) => (
                      <Text key={idx} style={styles.bullet}>
                        • {stripHtml(li?.description)}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Work History */}
        {work.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {work.map((w, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>
                  {w?.designation || "Designation"}
                  {w?.location ? ` – ${w.location}` : ""}
                </Text>
                {w?.start_date || w?.end_date ? (
                  <Text style={styles.meta}>
                    {dateRangeLabel(w?.start_date, w?.end_date)}
                  </Text>
                ) : null}
                {w?.description ? (
                  <Text style={styles.paragraph}>
                    {stripHtml(w.description)}
                  </Text>
                ) : null}
                {w?.list?.length ? (
                  <View style={{ marginTop: 4 }}>
                    {w.list!.map((li, idx) => (
                      <Text key={idx} style={styles.bullet}>
                        • {stripHtml(li?.description)}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

/* ------------------------------ Page ------------------------------ */

export default function AddEditResume() {
  const router = useRouter();
  const params = useParams();
  const resumeId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<UiResume>({});
  const rafRef = useRef<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch for edit mode
  const { data } = useGetResumeByIdQuery(
    { documentId: resumeId },
    { enabled: !!resumeId },
  );

  // API -> UI (build RangePicker values from start_date/end_date)
  useEffect(() => {
    if (!data?.resume) return;

    const ui = normalizeNullsDeep(data.resume) as UiResume;

    const uiForForm: UiResume = {
      ...ui,
      education: ui.education?.map((e) => ({
        ...e,
        date: toRangeValue(e?.start_date, e?.end_date),
      })),
      work_history: ui.work_history?.map((w) => ({
        ...w,
        date: toRangeValue(w?.start_date, w?.end_date),
      })),
    };

    form.setFieldsValue(uiForForm as any);
    setPreviewData(uiForForm);
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
      onSuccess: () => {
        openNotification("Resume updated successfully!");
      },
    });

  // Debounced live preview
  const onFormValuesChange = (_: any, all: any) => {
    const next = normalizeNullsDeep(all) as UiResume;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setPreviewData(next));
    }, 200);
  };

  const handleSave = async () => {
    const values = form.getFieldsValue();

    const payload = normalizeNullsDeep({
      resume_ref_id: values.resume_ref_id,
      name: values.name,
      designation: values.designation,
      introduction: values.introduction,

      // skills as-is
      skills: values.skills?.map((s: any) => ({
        skill_name: s?.skill_name,
        skill_level: s?.skill_level,
      })),

      // education: convert date range -> start_date/end_date
      education: values.education?.map((e: any) => {
        const { start_date, end_date } = serializeRangeToPair(e?.date);
        return {
          id: e?.id,
          education_name: e?.education_name,
          education_info: e?.education_info,
          start_date,
          end_date,
        };
      }),

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

      // work_history: convert date range -> start_date/end_date

      work_history: values.work_history?.map((w: any) => {
        const { start_date, end_date } = serializeRangeToPair(w?.date);
        return {
          id: w?.id,
          start_date,
          end_date,
          designation: w?.designation,
          location: w?.location,
          description: w?.description,
          list: w?.list?.map((li: any) => ({
            description: li?.description,
          })),
        };
      }),
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

      <Row gutter={32}>
        {/* LEFT: FORM */}
        <Col span={12}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={onFormValuesChange}>
            <Divider orientation="left">Personal Details</Divider>

            <LabelComponent text="Resume Reference ID" />
            <FormInput fieldName="resume_ref_id" type={FIELD_TYPE.text} />

            <LabelComponent text="Full Name" />
            <FormInput fieldName="name" type={FIELD_TYPE.text} />

            <LabelComponent text="Designation" />
            <FormInput fieldName="designation" type={FIELD_TYPE.text} />

            <LabelComponent text="Introduction" />
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
                          type={FIELD_TYPE.number} // ✅ Number input
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

            {/* Education */}
            <Divider orientation="left">Education</Divider>
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="mb-4 p-3 border rounded-md bg-gray-50">
                      <Row gutter={12}>
                        <Col span={12}>
                          <FormInput
                            fieldName={[name, "education_name"]}
                            type={FIELD_TYPE.text}
                            placeholder="Degree / Program"
                          />
                        </Col>
                        <Col span={12}>
                          {/* form-only 'date' (range) */}
                          <FormInput
                            fieldName={[name, "date"]}
                            type={FIELD_TYPE.dateRange}
                          />
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
                  ))}
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

            {/* Work History */}
            <Divider orientation="left">Work History</Divider>
            <Form.List name="work_history">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="mb-4 p-3 border rounded-md bg-gray-50">
                      <Row gutter={12}>
                        <Col span={12}>
                          {/* form-only 'date' (range) */}
                          <FormInput
                            fieldName={[name, "date"]}
                            type={FIELD_TYPE.dateRange}
                          />
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
                  ))}
                  <ButtonComponent
                    text="Add Work"
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
                onClick={async () => {
                  const docBlob = await pdf(
                    <ResumePDF data={previewData} />,
                  ).toBlob();
                  const url = URL.createObjectURL(docBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "resume.pdf";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
              />
            </div>
          </Form>
        </Col>

        {/* RIGHT: PDF PREVIEW */}
        <Col span={12}>
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
