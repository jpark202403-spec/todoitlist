"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Pin,
  Moon,
  Sun,
  ChevronDown,
  Check,
  Trash2,
  TableProperties,
  Edit2,
  X,
  Loader2,
  RefreshCw,
  Move,
} from "lucide-react";

// 컬러 팔레트 정의 (DESIGN.md 및 screen.png 반영)
export type NoteColor = "yellow" | "blue" | "green" | "pink";

export interface Note {
  id: string; // timestamp 값
  category: "todo" | "idea" | "etc";
  content: string;
  color: NoteColor;
  completed: boolean;
  createdAt: number;
  datetime?: string;
  rotation: number; // -2.5 ~ 2.5도 사이의 리얼한 자연스러운 기울기
  pinned?: boolean;
}

export interface SheetRowItem {
  timestamp?: string | number;
  "timestamp "?: string | number;
  datetime?: string;
  category?: string;
  content?: string;
  "content "?: string;
  color?: string;
  state?: string;
  order?: string | number;
}

const COLOR_CONFIG: Record<
  NoteColor,
  {
    bg: string;
    border: string;
    text: string;
    dot: string;
    title: string;
    shadow: string;
  }
> = {
  yellow: {
    bg: "bg-[#FEF08A] dark:bg-[#3d381e]",
    border: "border-[#FDE047] dark:border-[#ca8a04]/40",
    text: "text-[#78350F] dark:text-[#fef08a]",
    dot: "bg-[#EAB308]",
    title: "노랑 (할 일)",
    shadow: "rgba(234, 179, 8, 0.2)",
  },
  blue: {
    bg: "bg-[#BAE6FD] dark:bg-[#1a324b]",
    border: "border-[#7DD3FC] dark:border-[#0284c7]/40",
    text: "text-[#0C4A6E] dark:text-[#bae6fd]",
    dot: "bg-[#38BDF8]",
    title: "하늘 (아이디어)",
    shadow: "rgba(56, 189, 248, 0.2)",
  },
  green: {
    bg: "bg-[#BBF7D0] dark:bg-[#1b3d2b]",
    border: "border-[#86EFAC] dark:border-[#16a34a]/40",
    text: "text-[#14532D] dark:text-[#bbf7d0]",
    dot: "bg-[#4ADE80]",
    title: "연두 (습관/완료)",
    shadow: "rgba(74, 222, 128, 0.2)",
  },
  pink: {
    bg: "bg-[#FBCFE8] dark:bg-[#431f33]",
    border: "border-[#F9A8D4] dark:border-[#db2777]/40",
    text: "text-[#831843] dark:text-[#fbcfe8]",
    dot: "bg-[#F472B6]",
    title: "핑크 (중요/기타)",
    shadow: "rgba(244, 114, 182, 0.2)",
  },
};

const CATEGORY_NAMES: Record<Note["category"], string> = {
  todo: "✓ 할 일",
  idea: "💡 아이디어",
  etc: "📌 기타",
};

export default function Home() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [category, setCategory] = useState<Note["category"]>("todo");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");
  const [filter, setFilter] = useState<"all" | "todo" | "idea" | "etc">("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // 구글 시트 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sheetNotes, setSheetNotes] = useState<SheetRowItem[]>([]);
  const [isLoadingSheet, setIsLoadingSheet] = useState<boolean>(false);

  // 인라인 수정 모달 상태
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContentText, setEditContentText] = useState<string>("");

  // 더블클릭 드래그 & 드롭 위치 이동 관련 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ==========================================
  // 구글 시트 연동 비동기 함수들 (Next.js /api/gsheet 프록시 경유)
  // ==========================================

  // [READ] 구글 시트 메모 목록 가져오기
  const fetchGoogleSheetNotes = async () => {
    setIsLoadingSheet(true);
    try {
      const res = await fetch("/api/gsheet", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSheetNotes(json.data);
      } else {
        alert("구글 시트 데이터를 불러오지 못했습니다: " + (json.error || "오류"));
      }
    } catch (err) {
      console.error(err);
      alert("구글 시트 연동 오류: 네트워크 상태를 확인하세요.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  // [CREATE] 새 메모 추가 API 전송
  const createGoogleSheetNote = async (newNote: Note) => {
    try {
      await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          data: {
            timestamp: newNote.id,
            datetime: newNote.datetime || new Date(newNote.createdAt).toISOString(),
            category: newNote.category,
            content: newNote.content,
            color: newNote.color,
            state: newNote.completed ? "completed" : "active",
            order: 0,
          },
        }),
      });
    } catch (err) {
      console.error("구글 시트 생성 전송 실패:", err);
    }
  };

  // [UPDATE] 내용/작성일시/완료상태 수정 API 전송
  const updateGoogleSheetNote = async (
    timestamp: string,
    updateData: {
      content?: string;
      datetime?: string;
      state?: string;
      category?: string;
      color?: string;
    }
  ) => {
    try {
      await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          data: {
            timestamp,
            ...updateData,
          },
        }),
      });
    } catch (err) {
      console.error("구글 시트 업데이트 전송 실패:", err);
    }
  };

  // [DELETE] 메모 삭제 API 전송 (확실한 삭제 연동)
  const deleteGoogleSheetNote = async (timestamp: string) => {
    try {
      const res = await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          data: { timestamp },
        }),
      });
      const data = await res.json();
      console.log("구글 시트 삭제 응답:", data);
    } catch (err) {
      console.error("구글 시트 삭제 전송 실패:", err);
    }
  };

  // [CLEAR ALL] 전체 삭제 API 전송
  const clearAllGoogleSheetNotes = async () => {
    try {
      const res = await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clearAll",
        }),
      });
      const data = await res.json();
      console.log("구글 시트 전체 삭제 응답:", data);
    } catch (err) {
      console.error("구글 시트 전체 삭제 전송 실패:", err);
    }
  };

  // 로컬 스토리지 초기화
  useEffect(() => {
    const saved = localStorage.getItem("stickynotes_data");
    if (saved) {
      try {
        const parsed: Note[] = JSON.parse(saved);
        setNotes(
          parsed.filter(
            (n) => !n.content.includes("Next.js") && !n.content.includes("저녁 장보기")
          )
        );
      } catch {
        // fallback
      }
    } else {
      const initialNotes: Note[] = [
        {
          id: (Date.now() - 1800000).toString(),
          category: "idea",
          content: "착! 달라붙는 쫀득한 포스트잇 애니메이션 효과 추가",
          color: "blue",
          completed: false,
          createdAt: Date.now() - 1800000,
          datetime: new Date(Date.now() - 1800000).toISOString(),
          rotation: 1.5,
        },
      ];
      setNotes(initialNotes);
    }
  }, []);

  // 저장
  useEffect(() => {
    localStorage.setItem("stickynotes_data", JSON.stringify(notes));
  }, [notes]);

  // 다크 모드 토글 동기화
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // 사운드 시뮬레이션 및 포스트잇 추가 함수
  const handleAddNote = () => {
    if (!content.trim()) return;

    // 촉각적인 찰싹 소리 (Web Audio API)
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // Audio not permitted
    }

    const newId = Date.now().toString();
    const nowIso = new Date().toISOString();
    const randomRot = Number((Math.random() * 4 - 2).toFixed(1)); // -2도 ~ +2도 사이

    const newNote: Note = {
      id: newId,
      category,
      content: content.trim(),
      color: selectedColor,
      completed: false,
      createdAt: Date.now(),
      datetime: nowIso,
      rotation: randomRot,
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewlyAddedId(newId);
    setContent("");

    // 구글 시트에 CREATE 동기화
    createGoogleSheetNote(newNote);

    // 애니메이션 트리거 후 클리어
    setTimeout(() => {
      setNewlyAddedId(null);
    }, 600);
  };

  // 완료 토글 (상태 수정)
  const handleToggleComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updatedCompleted = !n.completed;
          updateGoogleSheetNote(n.id, {
            state: updatedCompleted ? "completed" : "active",
          });
          return { ...n, completed: updatedCompleted };
        }
        return n;
      })
    );
  };

  // 메모 내용 수정 모달 열기
  const handleOpenEdit = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNote(note);
    setEditContentText(note.content);
  };

  // 메모 내용 수정 저장
  const handleSaveEdit = () => {
    if (!editingNote || !editContentText.trim()) return;
    const updatedContent = editContentText.trim();
    const updatedTime = new Date().toISOString();

    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingNote.id
          ? { ...n, content: updatedContent, datetime: updatedTime }
          : n
      )
    );

    // 구글 시트에 내용 및 수정일시 UPDATE 동기화
    updateGoogleSheetNote(editingNote.id, {
      content: updatedContent,
      datetime: updatedTime,
    });

    setEditingNote(null);
  };

  // 개별 삭제
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    // 구글 시트에 DELETE 동기화
    deleteGoogleSheetNote(id);
  };

  // 전체 삭제
  const handleClearAll = () => {
    if (notes.length === 0) return;
    if (window.confirm("모든 포스트잇 목록을 삭제하시겠습니까? 구글 시트의 데이터도 삭제됩니다.")) {
      setNotes([]);
      localStorage.removeItem("stickynotes_data");
      clearAllGoogleSheetNotes();
    }
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // [메모확인] 모달 열기
  const handleOpenSheetModal = () => {
    setIsModalOpen(true);
    fetchGoogleSheetNotes();
  };

  // ==========================================
  // 더블클릭 후 드래그 & 드롭으로 메모 위치 이동 핸들러
  // ==========================================
  const handleDoubleClick = (id: string) => {
    setDraggingId(id);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggingId || e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    setNotes((prev) => {
      const sourceIndex = prev.findIndex((n) => n.id === sourceId);
      const targetIndex = prev.findIndex((n) => n.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });

    setDraggingId(null);
    setDragOverId(null);
  };

  // 카운트 계산
  const totalCount = notes.length;
  const todoCount = notes.filter((n) => n.category === "todo").length;
  const ideaCount = notes.filter((n) => n.category === "idea").length;
  const etcCount = notes.filter((n) => n.category === "etc").length;

  const filteredNotes = notes.filter((n) => {
    if (filter === "all") return true;
    return n.category === filter;
  });

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDark ? "bg-[#0b101b] text-slate-100" : "bg-[#F3F6FC] text-slate-800"
      } py-8 px-4 flex flex-col items-center select-none`}
    >
      <div className="w-full max-w-[480px] flex flex-col gap-5">
        {/* ================= 상단 헤더 ================= */}
        <header className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            {/* 붉은 압정 노란 배지 */}
            <div className="w-12 h-12 rounded-2xl bg-amber-400/90 shadow-md shadow-amber-400/30 flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105 active:scale-95 cursor-pointer">
              <span className="text-2xl drop-shadow">📌</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-black dark:text-black font-['Plus_Jakarta_Sans',sans-serif]">
                To do list
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-xs">
                V1.2
              </span>
            </div>
          </div>

          {/* 우측 상단 액션 버튼들 (메모확인 + 다크모드) */}
          <div className="flex items-center gap-2">
            {/* [메모확인] 버튼 (다크모드 버튼 왼쪽) */}
            <button
              onClick={handleOpenSheetModal}
              className={`h-11 px-3 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all duration-200 border shadow-xs cursor-pointer ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="구글 시트 메모 목록 확인"
            >
              <TableProperties className="w-4 h-4 text-emerald-500" />
              <span>메모확인</span>
            </button>

            {/* 다크모드 토글 버튼 */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 border shadow-xs cursor-pointer ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="다크 모드 전환"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* ================= 메인 인풋 카드 컨테이너 ================= */}
        <section
          className={`rounded-3xl p-5 border transition-all duration-200 shadow-xl ${
            isDark
              ? "bg-[#141d2e] border-slate-800/80 shadow-slate-950/40"
              : "bg-white border-slate-100 shadow-[0_10px_30px_rgba(30,41,59,0.06)]"
          }`}
        >
          {/* 범주 선택 라벨 및 목록 삭제 버튼 */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-400">
              범주 선택
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={notes.length === 0}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
              title="모든 포스트잇 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>목록삭제</span>
            </button>
          </div>

          {/* 범주 드롭다운 셀렉터 */}
          <div className="relative mb-3.5">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all cursor-pointer ${
                isDark
                  ? "bg-[#1a253a] border-slate-700/70 text-slate-200 hover:border-slate-600"
                  : "bg-[#F8FAFD] border-slate-200/90 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
                <span>{CATEGORY_NAMES[category]}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {dropdownOpen && (
              <div
                className={`absolute z-30 top-14 left-0 right-0 rounded-2xl border p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? "bg-[#1c273e] border-slate-700 text-slate-200"
                    : "bg-white border-slate-200/90 text-slate-700 shadow-slate-200/50"
                }`}
              >
                {(["todo", "idea", "etc"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      category === cat
                        ? isDark
                          ? "bg-slate-700/70 text-amber-300 font-semibold"
                          : "bg-amber-50 text-amber-700 font-semibold"
                        : isDark
                        ? "hover:bg-slate-800 text-slate-300"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span>{CATEGORY_NAMES[cat]}</span>
                    {category === cat && <Check className="w-4 h-4 text-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 텍스트 입력창 */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              placeholder="할 일 작성 및 새로운 아이디어를 포스트잇에 적어보세요..."
              rows={3}
              className={`w-full p-4 rounded-2xl border text-sm resize-none focus:outline-none transition-all placeholder:text-slate-400 leading-relaxed ${
                isDark
                  ? "bg-[#1a253a] border-slate-700/70 text-slate-100 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
                  : "bg-[#F8FAFD] border-slate-200/90 text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              }`}
            />
          </div>

          <div
            className={`pt-3 border-t flex items-center justify-between gap-3 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            {/* 컬러 팔레트 선택기 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 mr-0.5">
                컬러:
              </span>
              {(["yellow", "blue", "green", "pink"] as const).map((colorKey) => {
                const isSelected = selectedColor === colorKey;
                const paletteColors = {
                  yellow: "bg-[#FEF08A] border-[#EAB308]",
                  blue: "bg-[#BAE6FD] border-[#38BDF8]",
                  green: "bg-[#BBF7D0] border-[#4ADE80]",
                  pink: "bg-[#FBCFE8] border-[#F472B6]",
                };

                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setSelectedColor(colorKey)}
                    className={`relative w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
                      paletteColors[colorKey]
                    } ${
                      isSelected
                        ? "scale-115 ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#141d2e] shadow-md"
                        : "opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                    title={COLOR_CONFIG[colorKey].title}
                  />
                );
              })}
            </div>

            {/* 포스트잇 붙이기 버튼 */}
            <button
              onClick={handleAddNote}
              disabled={!content.trim()}
              className="flex-1 max-w-[170px] h-12 bg-linear-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#EAB308] hover:to-[#F59E0B] active:scale-96 disabled:opacity-40 disabled:pointer-events-none text-slate-900 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all duration-150 cursor-pointer"
            >
              <span className="text-lg leading-none">+</span>
              <span>포스트잇 붙이기</span>
            </button>
          </div>
        </section>

        {/* ================= 필터 탭 바 (전체, 할 일, 아이디어, 기타) ================= */}
        <section
          className={`flex items-center justify-between p-1 rounded-2xl border transition-all ${
            isDark
              ? "bg-[#141d2e] border-slate-800"
              : "bg-[#EAEFF8] border-slate-200/80"
          }`}
        >
          {[
            { id: "all", label: "전체", count: totalCount, badgeBg: "bg-slate-100 text-slate-700" },
            { id: "todo", label: "할 일", count: todoCount, badgeBg: "bg-amber-100 text-amber-700" },
            { id: "idea", label: "아이디어", count: ideaCount, badgeBg: "bg-sky-100 text-sky-700" },
            { id: "etc", label: "기타", count: etcCount, badgeBg: "bg-emerald-100 text-emerald-700" },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-slate-800 text-white shadow-sm font-extrabold"
                      : "bg-white text-slate-900 shadow-sm font-extrabold"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono leading-none ${
                    isDark
                      ? isActive
                        ? "bg-slate-700 text-slate-200"
                        : "bg-slate-800/80 text-slate-400"
                      : tab.badgeBg
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </section>

        {/* 이동 안내 힌트 문구 */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span>💡 메모를 <b>더블클릭</b>하면 드래그하여 순서를 이동할 수 있습니다.</span>
        </div>

        {/* ================= 포스트잇 보드 리스트 ================= */}
        <div className="flex flex-col gap-4 pb-8">
          {filteredNotes.length === 0 ? (
            <div
              className={`rounded-3xl border-2 border-dashed py-12 px-6 flex flex-col items-center justify-center text-center transition-colors ${
                isDark
                  ? "border-slate-800 text-slate-500 bg-slate-900/30"
                  : "border-slate-300 text-slate-400 bg-white/40"
              }`}
            >
              <div className="w-12 h-12 mb-3 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-xl">
                📌
              </div>
              <p className="text-sm font-medium">등록된 포스트잇이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                상단에서 새로운 메모를 적고 보드에 붙여보세요!
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const config = COLOR_CONFIG[note.color];
              const isNewlyAdded = newlyAddedId === note.id;
              const isThisDragging = draggingId === note.id;
              const isTargetOver = dragOverId === note.id;

              return (
                <article
                  key={note.id}
                  draggable={isThisDragging}
                  onDoubleClick={() => handleDoubleClick(note.id)}
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  onDragOver={(e) => handleDragOver(e, note.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, note.id)}
                  style={
                    {
                      "--stick-rotate": `${note.rotation}deg`,
                    } as React.CSSProperties
                  }
                  className={`group relative rounded-2xl p-4 border transition-all stick-note-card ${
                    config.bg
                  } ${config.border} ${
                    isNewlyAdded ? "animate-slap" : ""
                  } ${
                    note.completed ? "opacity-60 saturate-70" : "opacity-100"
                  } ${
                    isThisDragging
                      ? "ring-2 ring-amber-500 scale-102 shadow-2xl cursor-grab"
                      : "cursor-default"
                  } ${
                    isTargetOver && !isThisDragging
                      ? "border-dashed border-amber-500 bg-amber-50/20"
                      : ""
                  }`}
                >
                  {/* 상단 반투명 마스킹 와시 테이프 장식 */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 rounded-xs washi-tape -rotate-1 pointer-events-none" />

                  {/* 압정 고정 아이콘 (Pinned 상태일 때) */}
                  {note.pinned && (
                    <div className="absolute -top-3 left-3 text-red-500 drop-shadow-md z-10">
                      <Pin className="w-5 h-5 fill-red-500" />
                    </div>
                  )}

                  {/* 더블클릭 활성화 시 이동 모드 뱃지 */}
                  {isThisDragging && (
                    <div className="absolute -top-3 right-3 bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md animate-bounce">
                      <Move className="w-3 h-3" />
                      <span>이동 중...</span>
                    </div>
                  )}

                  {/* 카드 헤더 (카테고리 뱃지 & 액션 버튼들) */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span
                        className={`text-xs font-bold tracking-tight ${config.text}`}
                      >
                        {CATEGORY_NAMES[note.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* [완료 체크 버튼]: 수정 버튼과 동일한 크기(p-1, 3.5x3.5)로 왼쪽에 배치 */}
                      <button
                        onClick={(e) => handleToggleComplete(note.id, e)}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          note.completed
                            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                            : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                        title={note.completed ? "완료 취소" : "완료 체크"}
                      >
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </button>

                      {/* 내용 수정 버튼 */}
                      <button
                        onClick={(e) => handleOpenEdit(note, e)}
                        className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-md cursor-pointer"
                        title="메모 및 일시 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* 핀 토글 버튼 */}
                      <button
                        onClick={(e) => handleTogglePin(note.id, e)}
                        className={`p-1 rounded-md transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${
                          note.pinned
                            ? "text-red-500"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title={note.pinned ? "고정 해제" : "상단 고정"}
                      >
                        <Pin
                          className={`w-3.5 h-3.5 ${
                            note.pinned ? "fill-red-500" : ""
                          }`}
                        />
                      </button>

                      {/* 삭제 버튼 (구글시트 삭제 연동) */}
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-md cursor-pointer"
                        title="메모 삭제 (구글시트 연동)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 메모 내용 영역 */}
                  <div className="pt-0.5">
                    <p
                      className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                        config.text
                      } ${
                        note.completed
                          ? "line-through opacity-75 decoration-2 decoration-slate-500/60"
                          : ""
                      }`}
                    >
                      {note.content}
                    </p>
                  </div>

                  {/* 하단 작성일시 메타데이터 */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono opacity-60">
                    <span>
                      {note.datetime
                        ? new Date(note.datetime).toLocaleDateString()
                        : new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      {note.datetime
                        ? new Date(note.datetime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(note.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ================= Footer 영역 ================= */}
        <footer className="mt-auto py-6 text-center">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-tight">
            Copyright INU Post-it Todo List by 박재민
          </p>
        </footer>
      </div>

      {/* ================= 구글 시트 메모확인 팝업 모달 ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border flex flex-col max-h-[85vh] transition-all animate-in fade-in zoom-in-95 ${
              isDark ? "bg-[#131b2e] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold">구글 시트 연동 메모 목록</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchGoogleSheetNotes}
                  disabled={isLoadingSheet}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingSheet ? "animate-spin text-emerald-500" : ""}`} />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 모달 본문 (시트 리스트 테이블) */}
            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
              {isLoadingSheet ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-xs">구글 시트 데이터를 동기화하는 중입니다...</p>
                </div>
              ) : sheetNotes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  구글 시트에 저장된 메모가 없습니다.
                </div>
              ) : (
                sheetNotes.map((item, idx) => {
                  const itemTs = item.timestamp || item["timestamp "] || idx;
                  const itemContent = item.content || item["content "] || "";
                  return (
                    <div
                      key={itemTs}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {item.category || "todo"}
                        </span>
                        <span className="font-mono">
                          {item.datetime ? new Date(item.datetime).toLocaleString() : String(itemTs)}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{itemContent}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>색상: {item.color}</span>
                        <span
                          className={`font-semibold ${
                            item.state === "completed" ? "text-emerald-500" : "text-amber-500"
                          }`}
                        >
                          상태: {item.state === "completed" ? "완료됨" : "진행중"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 메모 내용 수정 모달 ================= */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border flex flex-col transition-all ${
              isDark ? "bg-[#131b2e] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold">메모 내용 수정</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={editContentText}
              onChange={(e) => setEditContentText(e.target.value)}
              rows={4}
              className={`w-full p-3 rounded-xl border text-sm resize-none focus:outline-none mb-4 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-amber-400"
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-400"
              }`}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
