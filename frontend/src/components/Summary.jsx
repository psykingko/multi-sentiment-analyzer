// Summary.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  Positive: "#4ade80", // green
  Negative: "#f87171", // red
  Neutral: "#a3a3a3",  // gray
};

const Summary = ({ summary }) => {
  if (!summary) return null;

  const { sentiment: overall_sentiment, average_score, sentiment_counts } = summary;

  const data = [
    { name: "Positive", value: sentiment_counts.Positive || 0 },
    { name: "Negative", value: sentiment_counts.Negative || 0 },
    { name: "Neutral", value: sentiment_counts.Neutral || 0 },
  ];

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Paragraph Summary</h2>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg mb-2">
          <span className="font-bold">Overall Sentiment:</span>{" "}
          <span
            className={`px-3 py-1 rounded-full font-semibold inline-block ${
              overall_sentiment === "Positive"
                ? "bg-green-200 text-green-800"
                : overall_sentiment === "Negative"
                ? "bg-red-200 text-red-800"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {overall_sentiment}
          </span>
        </p>
        <p className="text-lg">
          <span className="font-bold">Average Score:</span> {average_score}
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Summary;
