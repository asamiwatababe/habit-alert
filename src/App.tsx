import { useEffect, useState } from "react";
import "./App.css";

type Category = "健康" | "勉強" | "仕事" | "家事" | "PTA" | "その他";

type Habit = {
  id: string;
  name: string;
  category: Category;
};

type TodayStatus = {
  [habitId: string]: boolean; // true = 今日やった
};

const HABITS_KEY = "habitAlert_habits";
const STATUS_PREFIX = "habitAlert_status_";

const CATEGORY_OPTIONS: Category[] = [
  "健康",
  "勉強",
  "仕事",
  "家事",
  "PTA",
  "その他",
];

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
      // JSON を Habit[] として扱う
      const parsed = JSON.parse(savedHabits) as Habit[];

      // 既存データに category がない場合は「その他」を補完
      return parsed.map((h) => ({
        ...h,
        category: h.category ?? "その他",
      }));
    } catch (e) {
      console.error("Failed to parse habits from localStorage", e);
      return [];
    }

  });

  // 🔹 今日の状態：初期値として localStorage から読む
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
  const [newHabitCategory, setNewHabitCategory] =
    useState<Category>("健康");
  const [filterCategory, setFilterCategory] =
    useState<Category | "ALL">("ALL");

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
      category: newHabitCategory,
    };

    const nextHabits = [...habits, habit];
    setHabits(nextHabits);
    localStorage.setItem(HABITS_KEY, JSON.stringify(nextHabits));

    setNewHabitName("");
    setNewHabitCategory("健康");
  };

  const toggleHabitDoneToday = (id: string) => {
    const nextStatus: TodayStatus = {
      ...todayStatus,
      [id]: !todayStatus[id],
    };
    setTodayStatus(nextStatus);
    localStorage.setItem(
      STATUS_PREFIX + todayKey,
      JSON.stringify(nextStatus)
    );
  };

  const handleDeleteHabit = (id: string) => {
    const nextHabits = habits.filter((h) => h.id !== id);
    setHabits(nextHabits);
    localStorage.setItem(HABITS_KEY, JSON.stringify(nextHabits));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: removed, ...rest } = todayStatus;
    setTodayStatus(rest);
    localStorage.setItem(
      STATUS_PREFIX + todayKey,
      JSON.stringify(rest)
    );
  };

  // フィルター適用後の習慣一覧
  const filteredHabits =
    filterCategory === "ALL"
      ? habits
      : habits.filter((h) => h.category === filterCategory);

  // 今日未完了の習慣一覧（フィルター関係なく全体で判定）
  const undoneHabits = habits.filter(
    (h) => !(todayStatus[h.id] ?? false)
  );
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
          placeholder="習慣名（例：ストレッチ10分）"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
        />

        <select
          value={newHabitCategory}
          onChange={(e) =>
            setNewHabitCategory(e.target.value as Category)
          }
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button type="submit">追加</button>
      </form>

      {/* カテゴリフィルター */}
      <div className="filter-bar">
        <button
          type="button"
          className={filterCategory === "ALL" ? "active" : ""}
          onClick={() => setFilterCategory("ALL")}
        >
          すべて
        </button>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            className={filterCategory === c ? "active" : ""}
            onClick={() => setFilterCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 習慣一覧 */}
      <ul className="habit-list">
        {filteredHabits.map((habit) => {
          const done = todayStatus[habit.id] ?? false;
          return (
            <li key={habit.id} className={done ? "done" : ""}>
              <div className="habit-main">
                <label>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleHabitDoneToday(habit.id)}
                  />
                  {habit.name}
                </label>
                <span className="category-badge">
                  {habit.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteHabit(habit.id)}
              >
                削除
              </button>
            </li>
          );
        })}
        {filteredHabits.length === 0 && (
          <p>このカテゴリの習慣はありません。</p>
        )}
      </ul>
    </div>
  );
}

export default App;
