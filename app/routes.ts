import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),

  // Dictionary — tra cứu tất cả từ
  route("/vocabulary", "routes/vocabulary/list.tsx"),
  route("/vocabulary/add", "routes/vocabulary/add.tsx"),
  route("/vocabulary/:id/edit", "routes/vocabulary/edit.tsx"),
  route("/vocabulary/:id", "routes/vocabulary/detail.tsx"),

  // Study Sets (Groups)
  route("/groups", "routes/groups/list.tsx"),
  route("/groups/:id", "routes/groups/detail.tsx"),

  // Study modes — scoped to a group
  route("/groups/:id/flashcard", "routes/groups/flashcard.tsx"),
  route("/groups/:id/flashcard/summary", "routes/groups/flashcard-summary.tsx"),
  route("/groups/:id/typing", "routes/groups/typing.tsx"),
  route("/groups/:id/typing/summary", "routes/groups/typing-summary.tsx"),

  // Bulk import
  route("/import", "routes/import.tsx"),

  // Smart Import
  route("/smart-import", "routes/smart-import.tsx"),

  // Dashboard
  route("/dashboard", "routes/dashboard.tsx"),

  // Daily Review (SRS)
  route("/review", "routes/review.tsx"),

  // Session History
  route("/session-history", "routes/session-history.tsx"),

  // Grammar Reference
  route("/grammar", "routes/grammar.tsx"),

  // Grammar Practice (AI)
  route("/grammar/practice", "routes/grammar-practice.tsx"),

  // Writing Guide
  route("/writing-guide", "routes/writing-guide.tsx"),

  // Essay Practice (AI)
  route("/grammar/essay", "routes/grammar-essay.tsx"),

  // Essay History
  route("/grammar/essay/history", "routes/grammar-essay-history.tsx"),
] satisfies RouteConfig;
