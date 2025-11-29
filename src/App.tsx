import { useEffect, useState } from "react";
import "./App.css";

type Habit = {
  id: string;
  name: string;
};

type TodayStatus = {
  [habitId: string]: boolean; // true = 今日やった
};

const HABITS_KEY = "habitAlert_habits";
const STATUS_PREFIX = "habitAlert_status_";

const getTodayKey = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // 例: 2025-11-29
};

function App() {
  const todayKey = getTodayKey();

  // 🔹 習慣リスト：初期値として localStorage から読む
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window === "undefined") return [];
    const savedHabits = localStorage.getItem(HABITS_KEY);
    if (!savedHabits) return [];
    try {
      const parsed: Habit[] = JSON.parse(savedHabits);
      return parsed;
    } catch (e) {
      console.error("Failed to parse habits from localStorage", e);
      return [];
    }
  });

  // 🔹 今日の状態：こちらも初期値として localStorage から読む
  const [todayStatus, setTodayStatus] = useState<TodayStatus>(() => {
    if (typeof window === "undefined") return {};
    const savedStatus = localStorage.getItem(STATUS_PREFIX + todayKey);
    if (!savedStatus) return {};
    try {
      const parsed: TodayStatus = JSON.parse(savedStatus);
      return parsed;
    } catch (e) {
      console.error("Failed to parse todayStatus from localStorage", e);
      return {};
    }
  });

  const [newHabitName, setNewHabitName] = useState("");

  // 🔹 習慣リストが変わったら保存
  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  // 🔹 今日の状態が変わったら保存
  useEffect(() => {
    localStorage.setItem(
      STATUS_PREFIX + todayKey,
      JSON.stringify(todayStatus)
    );
  }, [todayStatus, todayKey]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
    };

    const nextHabits = [...habits, habit];
    setHabits(nextHabits);
    // 念のため即保存
    localStorage.setItem(HABITS_KEY, JSON.stringify(nextHabits));

    setNewHabitName("");
  };

  const toggleHabitDoneToday = (id: string) => {
    const nextStatus: TodayStatus = {
      ...todayStatus,
      [id]: !todayStatus[id],
    };
    setTodayStatus(nextStatus);
    // 念のため即保存
    localStorage.setItem(
      STATUS_PREFIX + todayKey,
      JSON.stringify(nextStatus)
    );
  };

  const handleDeleteHabit = (id: string) => {
    // 習慣リストから削除
    const nextHabits = habits.filter((h) => h.id !== id);
    setHabits(nextHabits);
    localStorage.setItem(HABITS_KEY, JSON.stringify(nextHabits));

    // 今日の状態からもその習慣のキーを削除
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: removed, ...rest } = todayStatus;
    setTodayStatus(rest);
    localStorage.setItem(
      STATUS_PREFIX + todayKey,
      JSON.stringify(rest)
    );
  };


  // 1つでも「今日未完」の習慣があればアラート true
  // 今日未完了の習慣一覧
  const undoneHabits = habits.filter((h) => !(todayStatus[h.id] ?? false));

  // 1つでも未完了があればアラート表示
  const hasUndoneToday = undoneHabits.length > 0;


  return (
    <div className="app">
      <h1>HabitAlert</h1>
      <p>今日の日付: {todayKey}</p>

      {/* 🔔 アラートバー */}
      {hasUndoneToday && (
        <div className="alert">
          <div className="alert-title">
            🔔 未完了の習慣が {undoneHabits.length} 件あります
          </div>
          <div className="alert-list">
            {undoneHabits.map((h) => (
              <span key={h.id} className="alert-pill">
                {h.name}
              </span>
            ))}
          </div>
        </div>
      )}


      {/* 習慣追加フォーム */}
      <form onSubmit={handleAddHabit} className="habit-form">
        <input
          type="text"
          placeholder="習慣名（例：歯磨き・英語30分など）"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>

      {/* 習慣一覧 */}
      <ul className="habit-list">
        {habits.map((habit) => {
          const done = todayStatus[habit.id] ?? false;
          return (
            <li key={habit.id} className={done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleHabitDoneToday(habit.id)}
                />
                {habit.name}
              </label>

              <button
                type="button"
                onClick={() => handleDeleteHabit(habit.id)}
              >
                削除
              </button>
            </li>
          );
        })}
        {habits.length === 0 && (
          <p>まだ習慣がありません。追加してみましょう。</p>
        )}
      </ul>


    </div>
  );
}

export default App;
