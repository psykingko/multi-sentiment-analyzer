import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SentimentResult = ({ data }) => {
  if (!data || data.length === 0) return null;

  const getColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "#4ade80"; // green
      case "negative":
        return "#f87171"; // red
      case "neutral":
      default:
        return "#a3a3a3"; // gray
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Sentence-wise Sentiment</h2>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 border rounded-lg shadow-sm transition duration-300`}
            style={{
              backgroundColor: `${getColor(item.sentiment)}20`,
              borderColor: getColor(item.sentiment),
              color: getColor(item.sentiment),
            }}
          >
            <p className="font-medium mb-2">“{item.sentence}”</p>
            <div className="text-sm">
              <span className="font-semibold">Sentiment:</span> {item.sentiment}{" "}
              &nbsp;|&nbsp;
              <span className="font-semibold">Score:</span> {item.score}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Sentiment Score Chart</h3>
        <div className="h-72 bg-white dark:bg-gray-800 p-4 rounded shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="sentence" tick={{ fontSize: 12 }} hide />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="score">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.sentiment)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SentimentResult;
