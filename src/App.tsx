import { useState } from "react";
import "./App.css";

type Habit = {
  id: string;
  name: string;
};

type TodayStatus = {
  [habitId: string]: boolean; // true = 今日やった
};

const getTodayKey = () => {
  const d = new Date();
  // 2025-11-29 みたいなキー
  return d.toISOString().slice(0, 10);
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({});
  const [newHabitName, setNewHabitName] = useState("");

  const todayKey = getTodayKey();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
    };
    setHabits((prev) => [...prev, habit]);
    setNewHabitName("");
  };

  const toggleHabitDoneToday = (id: string) => {
    setTodayStatus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasUndoneToday =
    habits.length > 0 &&
    habits.some((h) => !todayStatus[h.id]); // 1つでも false/undefined があればアラート

  return (
    <div className="app">
      <h1>HabitAlert</h1>
      <p>今日の日付: {todayKey}</p>

      {/* 🔔 アラートバー */}
      {hasUndoneToday && (
        <div className="alert">
          未完了の習慣があります！
        </div>
      )}

      {/* 習慣追加フォーム */}
      <form onSubmit={handleAddHabit} className="habit-form">
        <input
          type="text"
          placeholder="習慣名（例：ストレッチ10分）"
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
