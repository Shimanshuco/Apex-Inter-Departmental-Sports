import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { API_ENDPOINTS } from "../config/api";
import axios from "axios";

interface Rule {
  _id: string;
  title: string;
  description: string;
  sport: string;
  category: string;
  order: number;
}

// Parse rich text with **bold** and bullet points
const parseRichText = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const processInlineFormatting = (
    line: string,
    key: number,
  ): React.ReactNode => {
    // Process **bold** text
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      // Check for bold **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index!);
        if (beforeBold) parts.push(beforeBold);
        parts.push(
          <strong
            key={`b-${key}-${partKey++}`}
            className="font-bold text-slate-900"
          >
            {boldMatch[1]}
          </strong>,
        );
        remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return <span key={key}>{parts}</span>;
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-none space-y-2 my-3">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></span>
              <span className="text-slate-700 leading-relaxed">
                {processInlineFormatting(item, i)}
              </span>
            </li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check for bullet points (-, *, •, or numbered like 1., 2.)
    const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)$/);
    const numberedMatch = trimmedLine.match(/^\d+[.)]\s*(.+)$/);

    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
    } else if (numberedMatch) {
      currentList.push(numberedMatch[1]);
    } else if (trimmedLine === "") {
      flushList();
      elements.push(<div key={`br-${index}`} className="h-2"></div>);
    } else {
      flushList();
      elements.push(
        <p key={index} className="text-slate-700 leading-relaxed mb-2">
          {processInlineFormatting(trimmedLine, index)}
        </p>,
      );
    }
  });

  flushList();

  return <div className="rule-content">{elements}</div>;
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sports, setSports] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.RULES_LIST);
      const rulesData = response.data.rules || [];
      setRules(rulesData);

      const uniqueSports = [
        ...new Set(rulesData.map((r: Rule) => r.sport).filter(Boolean)),
      ] as string[];
      const uniqueCategories = [
        ...new Set(rulesData.map((r: Rule) => r.category).filter(Boolean)),
      ] as string[];
      setSports(uniqueSports);
      setCategories(uniqueCategories);

      // Auto-expand first sport if available
      if (uniqueSports.length > 0) {
        setExpandedSport(uniqueSports[0]);
      }
    } catch (err) {
      console.error("Failed to fetch rules");
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const sportMatch =
        selectedSport === "All" || rule.sport === selectedSport;
      const categoryMatch =
        selectedCategory === "All" || rule.category === selectedCategory;
      const searchMatch =
        searchQuery === "" ||
        rule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return sportMatch && categoryMatch && searchMatch;
    });
  }, [rules, selectedSport, selectedCategory, searchQuery]);

  // Group rules by sport, then by category
  const groupedRules = useMemo(() => {
    const grouped: Record<string, Record<string, Rule[]>> = {};

    filteredRules.forEach((rule) => {
      if (!grouped[rule.sport]) {
        grouped[rule.sport] = {};
      }
      if (!grouped[rule.sport][rule.category]) {
        grouped[rule.sport][rule.category] = [];
      }
      grouped[rule.sport][rule.category].push(rule);
    });

    // Sort rules within each category
    Object.keys(grouped).forEach((sport) => {
      Object.keys(grouped[sport]).forEach((category) => {
        grouped[sport][category].sort((a, b) => a.order - b.order);
      });
    });

    return grouped;
  }, [filteredRules]);

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      Football: "⚽",
      Volleyball: "🏐",
      Basketball: "🏀",
      Kabaddi: "🤼",
      Badminton: "🏸",
      Chess: "♟️",
      "Kho Kho": "🏃",
      "Table Tennis": "🏓",
      "Tug of War": "🪢",
      Cricket: "🏏",
      Athletics: "🏃‍♂️",
      General: "📋",
    };
    return icons[sport] || "📖";
  };

  const getSportColor = (sport: string) => {
    type SportColorType = {
      bg: string;
      border: string;
      text: string;
      gradient: string;
    };
    const colors: Record<string, SportColorType> = {
      Football: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        gradient: "from-emerald-500 to-emerald-600",
      },
      Volleyball: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        gradient: "from-amber-500 to-amber-600",
      },
      Basketball: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        gradient: "from-orange-500 to-orange-600",
      },
      Kabaddi: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        gradient: "from-red-500 to-red-600",
      },
      Badminton: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-700",
        gradient: "from-sky-500 to-sky-600",
      },
      Chess: {
        bg: "bg-slate-100",
        border: "border-slate-300",
        text: "text-slate-700",
        gradient: "from-slate-600 to-slate-700",
      },
      "Kho Kho": {
        bg: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-700",
        gradient: "from-violet-500 to-violet-600",
      },
      "Table Tennis": {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        text: "text-cyan-700",
        gradient: "from-cyan-500 to-cyan-600",
      },
      "Tug of War": {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        gradient: "from-yellow-500 to-yellow-600",
      },
      Cricket: {
        bg: "bg-lime-50",
        border: "border-lime-200",
        text: "text-lime-700",
        gradient: "from-lime-500 to-lime-600",
      },
      Athletics: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        gradient: "from-rose-500 to-rose-600",
      },
      General: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        gradient: "from-indigo-500 to-indigo-600",
      },
    };
    return (
      colors[sport] || {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        gradient: "from-blue-500 to-blue-600",
      }
    );
  };

  const getCategoryStyle = (category: string) => {
    type CategoryStyleType = {
      bg: string;
      text: string;
      border: string;
      icon: string;
      iconBg: string;
    };
    const styles: Record<string, CategoryStyleType> = {
      "General Rules": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "📜",
        iconBg: "bg-blue-100",
      },
      "Game Rules": {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: "🎮",
        iconBg: "bg-green-100",
      },
      Eligibility: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: "✅",
        iconBg: "bg-purple-100",
      },
      Conduct: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: "🤝",
        iconBg: "bg-rose-100",
      },
      Scoring: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "🏆",
        iconBg: "bg-amber-100",
      },
      Equipment: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: "🎒",
        iconBg: "bg-orange-100",
      },
      Other: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: "📌",
        iconBg: "bg-slate-100",
      },
    };
    return (
      styles[category] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "📄",
        iconBg: "bg-gray-100",
      }
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "General Rules": "bg-blue-100 text-blue-800 border-blue-200",
      "Game Rules": "bg-green-100 text-green-800 border-green-200",
      Eligibility: "bg-purple-100 text-purple-800 border-purple-200",
      Conduct: "bg-rose-100 text-rose-800 border-rose-200",
      Scoring: "bg-amber-100 text-amber-800 border-amber-200",
      Equipment: "bg-orange-100 text-orange-800 border-orange-200",
      Other: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const totalRulesCount = filteredRules.length;
  const sportsList = Object.keys(groupedRules).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      <main>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Rule Book
            </h1>
            <p className="text-slate-300 mt-1 text-sm sm:text-base">
              Official rules and regulations for all sports events
            </p>
          </div>
        </div>

        {/* Main Content */}
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
          {/* Search and Filter Section */}
          <div className="rounded-xl bg-white shadow-sm border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-4 sm:p-5">
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search rules by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Sport Filter */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Filter by Sport
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSport("All")}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedSport === "All"
                        ? "bg-slate-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Sports
                  </button>
                  {sports.map((sport) => {
                    const sportColor = getSportColor(sport);
                    return (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedSport === sport
                            ? "bg-slate-600 text-white"
                            : `${sportColor.bg} ${sportColor.text} hover:shadow-sm border ${sportColor.border}`
                        }`}
                      >
                        {getSportIcon(sport)} {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedCategory === "All"
                        ? "bg-slate-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => {
                    const catStyle = getCategoryStyle(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedCategory === cat
                            ? "bg-slate-600 text-white"
                            : `${catStyle.bg} ${catStyle.text} hover:shadow-sm border ${catStyle.border}`
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Rules Content */}
          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
              </div>
              <p className="mt-6 text-slate-500 font-medium">
                Loading rules...
              </p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">📖</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700">
                No Rules Found
              </h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                {selectedSport === "All" &&
                selectedCategory === "All" &&
                searchQuery === ""
                  ? "No rules have been added yet. Check back later!"
                  : "No rules match your current filters. Try adjusting your search criteria."}
              </p>
              {(selectedSport !== "All" ||
                selectedCategory !== "All" ||
                searchQuery !== "") && (
                <button
                  onClick={() => {
                    setSelectedSport("All");
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sportsList.map((sport) => {
                const sportColor = getSportColor(sport);
                const sportCategories = Object.keys(groupedRules[sport]).sort();
                const isExpanded = expandedSport === sport;
                const sportRulesCount = Object.values(
                  groupedRules[sport],
                ).flat().length;

                return (
                  <div
                    key={sport}
                    className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isExpanded
                        ? `${sportColor.border} shadow-xl`
                        : "border-slate-200 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {/* Sport Header - Clickable */}
                    <button
                      onClick={() =>
                        setExpandedSport(isExpanded ? null : sport)
                      }
                      className={`w-full bg-gradient-to-r ${sportColor.gradient} px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl">
                            {getSportIcon(sport)}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white">
                            {sport}
                          </h2>
                          <p className="text-white/80 text-sm">
                            {sportRulesCount} rule
                            {sportRulesCount !== 1 ? "s" : ""} •{" "}
                            {sportCategories.length} categor
                            {sportCategories.length !== 1 ? "ies" : "y"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Sport Content - Categories and Rules */}
                    {isExpanded && (
                      <div className="bg-white">
                        {sportCategories.map((category) => {
                          const catStyle = getCategoryStyle(category);
                          const categoryRules = groupedRules[sport][category];
                          const isCategoryExpanded =
                            expandedCategory === `${sport}-${category}`;

                          return (
                            <div
                              key={category}
                              className="border-t border-slate-100"
                            >
                              {/* Category Header */}
                              <button
                                onClick={() =>
                                  setExpandedCategory(
                                    isCategoryExpanded
                                      ? null
                                      : `${sport}-${category}`,
                                  )
                                }
                                className={`w-full px-5 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${catStyle.bg} hover:brightness-95 transition-all`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 ${catStyle.iconBg} rounded-lg flex items-center justify-center`}
                                  >
                                    <span className="text-lg">
                                      {catStyle.icon}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <h3
                                      className={`font-bold ${catStyle.text}`}
                                    >
                                      {category}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                      {categoryRules.length} rule
                                      {categoryRules.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`w-8 h-8 rounded-full ${catStyle.iconBg} flex items-center justify-center transition-transform duration-300 ${isCategoryExpanded ? "rotate-180" : ""}`}
                                >
                                  <svg
                                    className={`w-4 h-4 ${catStyle.text}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </div>
                              </button>

                              {/* Rules List */}
                              {isCategoryExpanded && (
                                <div className="divide-y divide-slate-100">
                                  {categoryRules.map((rule, index) => (
                                    <div
                                      key={rule._id}
                                      className="px-5 sm:px-6 py-4 sm:py-5 hover:bg-slate-50/50 transition-colors"
                                    >
                                      <div className="flex items-start gap-4">
                                        {/* Rule Number Badge */}
                                        <div
                                          className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${sportColor.gradient} flex items-center justify-center shadow-sm`}
                                        >
                                          <span className="text-white font-bold text-sm">
                                            {index + 1}
                                          </span>
                                        </div>

                                        {/* Rule Content */}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-2">
                                            {rule.title}
                                          </h4>
                                          <div className="text-sm text-slate-600">
                                            {parseRichText(rule.description)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Navigation Sidebar for Desktop */}
          {!loading && filteredRules.length > 0 && selectedSport === "All" && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🧭</span>
                <h2 className="text-xl font-bold text-slate-900">
                  Quick Navigation
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {sports.map((sport) => {
                  const sportColor = getSportColor(sport);
                  const count = rules.filter((r) => r.sport === sport).length;
                  return (
                    <button
                      key={sport}
                      onClick={() => {
                        setSelectedSport(sport);
                        setExpandedSport(sport);
                      }}
                      className={`group relative ${sportColor.bg} border-2 ${sportColor.border} rounded-2xl p-4 hover:shadow-xl transition-all duration-300 text-center overflow-hidden`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${sportColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      ></div>
                      <div className="relative">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {getSportIcon(sport)}
                        </div>
                        <div
                          className={`font-bold text-sm ${sportColor.text} group-hover:text-white transition-colors`}
                        >
                          {sport}
                        </div>
                        <div className="text-xs text-slate-500 group-hover:text-white/80 mt-1 transition-colors">
                          {count} rule{count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}
