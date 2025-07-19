import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../assets/analysing.png';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#181A1B',
    color: '#FFD700',
    padding: 32,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottom: '2 solid #FFD700',
    paddingBottom: 10,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1.5,
  },
  userInfo: {
    fontSize: 12,
    color: '#00FFD0',
    marginBottom: 10,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#23272b',
  },
  sectionTitle: {
    color: '#00FFD0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 2,
    wordBreak: 'break-word',
  },
  insights: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#181A1B',
    borderRadius: 6,
  },
  insightLabel: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 4,
  },
  insightValue: {
    color: '#fff',
    fontSize: 13,
  },
  summaryTable: {
    marginTop: 8,
    border: '1 solid #FFD700',
    borderRadius: 6,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1 solid #FFD700',
    padding: 6,
    backgroundColor: '#181A1B',
  },
  summaryCell: {
    color: '#FFD700',
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
  summaryHeader: {
    backgroundColor: '#23272b',
    color: '#00FFD0',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 6,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD700',
    marginVertical: 16,
    opacity: 0.2,
  },
  footer: {
    marginTop: 32,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 12,
    borderTop: '1 solid #FFD700',
    paddingTop: 8,
    letterSpacing: 1,
  },
});

function getUserDisplay(user) {
  if (!user) return 'Anonymous';
  if (user.email) return user.email;
  if (user.username) return user.username;
  if (user.name) return user.name;
  return 'User';
}

function getSentimentLabel(sentiment) {
  if (!sentiment) return '';
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
}

function groupEmotions(analysis) {
  // Returns { emotion: { count } }
  const counts = {};
  if (!Array.isArray(analysis)) return counts;
  analysis.forEach(item => {
    const key = (item.emotion || item.sentiment || 'Unknown').toLowerCase();
    if (!counts[key]) counts[key] = { count: 0 };
    counts[key].count++;
  });
  return counts;
}

export default function TextAnalysisPDF({ analysis, summary, userText, user }) {
  const now = new Date();
  // Parse summary if it's a JSON string
  let parsedSummary = summary;
  if (typeof summary === 'string') {
    try {
      parsedSummary = JSON.parse(summary);
    } catch {
      parsedSummary = summary;
    }
  }
  // Extract distribution if present
  let distribution = null;
  let overallSentiment = '';
  let confidence = '';
  if (parsedSummary && typeof parsedSummary === 'object') {
    if (parsedSummary.mental_state_distribution) {
      distribution = parsedSummary.mental_state_distribution;
    }
    if (parsedSummary.sentiment) {
      overallSentiment = parsedSummary.sentiment;
    }
    if (parsedSummary.confidence) {
      confidence = parsedSummary.confidence;
    }
  }
  // Group emotions for summary table
  const emotionCounts = groupEmotions(analysis);
  const total = Object.values(emotionCounts).reduce((sum, e) => sum + e.count, 0);
  // Get top 3 emotions
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([emotion, { count }]) => `${getSentimentLabel(emotion)} (${((count / total) * 100).toFixed(1)}%)`)
    .join(', ');

  // Split input text into paragraphs for better page flow
  const paragraphs = userText ? userText.split(/\n+/).filter(Boolean) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo and app name */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.appName}>Multi-Sentiment Analyzer</Text>
        </View>
        <Text style={styles.userInfo}>User: {getUserDisplay(user)}</Text>
        <Text style={styles.value}>{now.toLocaleString()}</Text>
        {/* Input Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Text</Text>
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <Text key={idx} style={styles.value}>{para}</Text>
            ))
          ) : (
            <Text style={styles.value}>{userText}</Text>
          )}
        </View>
        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insights}>
            <Text><Text style={styles.insightLabel}>Overall Sentiment:</Text> <Text style={styles.insightValue}>{getSentimentLabel(overallSentiment) || 'N/A'}</Text></Text>
            <Text><Text style={styles.insightLabel}>Confidence:</Text> <Text style={styles.insightValue}>{confidence ? (confidence * 100).toFixed(1) + '%' : 'N/A'}</Text></Text>
            <Text><Text style={styles.insightLabel}>Top Emotions:</Text> <Text style={styles.insightValue}>{topEmotions || 'N/A'}</Text></Text>
          </View>
        </View>
        {/* Emotion Distribution Table */}
        {distribution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotion Distribution</Text>
            <View style={styles.summaryTable}>
              <View style={[styles.summaryRow, { backgroundColor: '#23272b' }]}> 
                <Text style={styles.summaryHeader}>Emotion</Text>
                <Text style={styles.summaryHeader}>Score</Text>
                <Text style={styles.summaryHeader}>Count</Text>
              </View>
              {Object.entries(distribution).map(([emotion, score], i) => (
                <View key={emotion} style={styles.summaryRow}>
                  <Text style={styles.summaryCell}>{getSentimentLabel(emotion)}</Text>
                  <Text style={styles.summaryCell}>{(score * 100).toFixed(1)}%</Text>
                  <Text style={styles.summaryCell}>{emotionCounts[emotion.toLowerCase()] ? emotionCounts[emotion.toLowerCase()].count : 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Friendly Footer */}
        <Text style={styles.footer}>Generated by Multi-Sentiment Analyzer | {now.getFullYear()}</Text>
      </Page>
    </Document>
  );
} 