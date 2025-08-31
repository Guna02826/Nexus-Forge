import { useEffect, useState } from "react";
import API from "../api";
import { getCurrentUser } from "../utils/auth";

export default function ActivityFeed({ id }) { 
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!id) return; // skip if no user id

  loadFeed();

  const interval = setInterval(() => {
    loadFeed();
  }, 10000);

  return () => clearInterval(interval);
}, [id]);

const loadFeed = async () => {
  setLoading(true);
  try {
    // Use the id prop directly here:
    const url = id ? `/docs/activity/feed?userId=${id}` : "/docs/activity/feed";
    const res = await API.get(url);
    setFeed(res.data);
  } catch (err) {
    console.error("Feed load error", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <section
      aria-live="polite"
      aria-busy={loading}
      className="bg-white p-4 rounded-md shadow-sm max-h-[70vh] overflow-auto"
    >
      {loading && feed.length === 0 ? (
        <p className="text-gray-500 italic text-center">Loading...</p>
      ) : feed.length === 0 ? (
        <p className="text-gray-400 italic text-center">No recent activity</p>
      ) : (
        <ul className="space-y-3 text-sm text-gray-700">
          {feed.map((a) => (
            <li key={a._id} className="border-b last:border-none pb-2">
              <span className="font-medium text-gray-900">{a.userId?.name || "Unknown User"}</span>{" "}
              <span>
                {a.action ? a.action + (a.action.endsWith('d') ? '' : 'd') : "performed an action"}{" "}
              </span>
              <span className="italic text-gray-700">{a.docId?.title || "Untitled Document"}</span>{" "}
              <time
                dateTime={a.createdAt}
                className="text-gray-400 text-xs"
                title={new Date(a.createdAt).toLocaleString()}
              >
                ({new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
