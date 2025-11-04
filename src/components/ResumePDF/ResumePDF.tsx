import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

// (optional) web font
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuSga3.woff2" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Inter", fontSize: 11, color: "#222" },
  header: {
    marginBottom: 12,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 8,
  },
  name: { fontSize: 24, fontWeight: 700 },
  designation: { fontSize: 12, marginTop: 4, color: "#555" },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: "#111",
  },
  workItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "1px solid #f0f0f0",
  },
  workHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workTitle: { fontWeight: 700 },
  workMeta: { color: "#666" },
});

const fmt = (d: any) =>
  d && dayjs(d).isValid() ? dayjs(d).format("MMM YYYY") : "";
const fmtRange = (r: any) => {
  if (!r) return "";
  if (Array.isArray(r) && r.length === 2)
    return `${fmt(r[0])} - ${r[1] ? fmt(r[1]) : "Present"}`;
  if (r?.start || r?.end)
    return `${fmt(r.start)} - ${r.end ? fmt(r.end) : "Present"}`;
  return fmt(r);
};
const stripHtml = (s: string) => (s || "").replace(/<[^>]*>/g, "").trim();

export default function ResumePDF({ data }: { data: any }) {
  const skills = data?.skills || [];
  const work = data?.work_history || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data?.name || "Your Name"}</Text>
          {data?.designation ? (
            <Text style={styles.designation}>{data.designation}</Text>
          ) : null}
        </View>

        {data?.introduction ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text>{stripHtml(data.introduction)}</Text>
          </View>
        ) : null}

        {skills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((s: any, i: number) => (
              <Text key={i}>
                • {s?.skill_name || "Skill"}
                {s?.skill_level ? ` (${s.skill_level})` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {work.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {work.map((w: any, i: number) => (
              <View key={i} style={styles.workItem}>
                <View style={styles.workHeader}>
                  <Text style={styles.workTitle}>
                    {w?.designation || "Designation"}
                    {w?.location ? ` — ${w.location}` : ""}
                  </Text>
                  <Text style={styles.workMeta}>{fmtRange(w?.date)}</Text>
                </View>
                {w?.experience_information ? (
                  <Text>{stripHtml(w.experience_information)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
