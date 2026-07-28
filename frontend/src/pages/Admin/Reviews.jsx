import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Clock,
  CheckCircle2,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";

import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";
import ReviewsToolbar from "../../components/admin/reviews/ReviewsToolbar";
import ReviewsTable from "../../components/admin/reviews/ReviewsTable";
import ReviewDetailPanel from "../../components/admin/reviews/ReviewDetailPanel";

export default function Reviews() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const [selectedId, setSelectedId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadStats = () => {
    api.get("/admin/reviews/stats/").then((res) => setStats(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadStats();
    setStatsLoading(false);
  }, []);

  const fetchReviews = useCallback(() => {
    setReviewsLoading(true);
    api.get("/admin/reviews/", {
      params: {
        search: search || undefined,
        status: status || undefined,
        rating: rating || undefined,
        page,
      },
    })
      .then((res) => {
        setReviews(res.data.results);
        setCount(res.data.count);
        setSelectedId((prev) => prev ?? res.data.results[0]?.id ?? null);
      })
      .catch((err) => console.error("فشل تحميل التقييمات:", err))
      .finally(() => setReviewsLoading(false));
  }, [search, status, rating, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, rating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const loadDetail = (id) => {
    setDetailLoading(true);
    api.get(`/admin/reviews/${id}/`)
      .then((res) => setSelectedReview(res.data))
      .catch((err) => console.error("فشل تحميل تفاصيل التقييم:", err))
      .finally(() => setDetailLoading(false));
  };

  useEffect(() => {
    if (!selectedId) {
      setSelectedReview(null);
      return;
    }
    loadDetail(selectedId);
  }, [selectedId]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setRating("");
  };

  const updateLocalReview = (reviewId, updatedData) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updatedData } : r)));
    setSelectedReview((prev) => (prev && prev.id === reviewId ? { ...prev, ...updatedData } : prev));
  };

  const handleApprove = async (reviewId) => {
    setActionLoading("approve");
    try {
      const res = await api.patch(`/admin/reviews/${reviewId}/approve/`);
      updateLocalReview(reviewId, res.data);
      loadStats();
    } catch (err) {
      alert("حصل خطأ أثناء اعتماد التقييم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    setActionLoading("reject");
    try {
      const res = await api.patch(`/admin/reviews/${reviewId}/reject/`);
      updateLocalReview(reviewId, res.data);
      loadStats();
    } catch (err) {
      alert("حصل خطأ أثناء رفض التقييم");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetStatus = async (reviewId) => {
    setActionLoading("reset");
    try {
      const res = await api.patch(`/admin/reviews/${reviewId}/reset-status/`);
      updateLocalReview(reviewId, res.data);
      loadStats();
    } catch (err) {
      alert("حصل خطأ أثناء تحديث الحالة");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (reviewId, replyText) => {
    setActionLoading("reply");
    try {
      const res = await api.patch(`/admin/reviews/${reviewId}/reply/`, { admin_reply: replyText });
      updateLocalReview(reviewId, res.data);
    } catch (err) {
      alert("حصل خطأ أثناء حفظ الرد");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا التقييم نهائيًا؟")) return;
    setActionLoading("delete");
    try {
      await api.delete(`/admin/reviews/${reviewId}/`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSelectedId(null);
      loadStats();
    } catch (err) {
      alert("حصل خطأ أثناء حذف التقييم");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">التقييمات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/admin" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span>التقييمات</span>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل التقييمات</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Star} title="إجمالي التقييمات" value={statsLoading ? "..." : stats?.total_reviews ?? 0} note="كل الأوقات" noteColor="text-primary/40" />
        <StatCard icon={Clock} title="قيد المراجعة" value={statsLoading ? "..." : stats?.pending ?? 0} note="محتاجة موافقة" noteColor="text-amber-600" />
        <StatCard icon={CheckCircle2} title="تقييمات معتمدة" value={statsLoading ? "..." : stats?.approved ?? 0} note="منشورة" noteColor="text-emerald-600" />
        <StatCard icon={Star} title="متوسط التقييم" value={statsLoading ? "..." : stats?.average_rating ?? 0} note={`⭐ (${stats?.total_reviews ?? 0})`} noteColor="text-secondary" />
        <StatCard icon={ThumbsUp} title="تقييمات 5 نجوم" value={statsLoading ? "..." : stats?.five_star_count ?? 0} note={statsLoading ? "" : `${stats?.five_star_percent ?? 0}% من الإجمالي`} noteColor="text-emerald-600" />
        <StatCard icon={MessageCircle} title="بها تعليقات" value={statsLoading ? "..." : stats?.has_comment_count ?? 0} note={statsLoading ? "" : `${stats?.has_comment_percent ?? 0}% من الإجمالي`} noteColor="text-primary/40" />
      </div>

      {/* Toolbar + table + detail panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <ReviewsToolbar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              rating={rating}
              onRatingChange={setRating}
              onReset={handleReset}
            />
          </SectionCard>

          <SectionCard>
            <ReviewsTable
              reviews={reviews}
              loading={reviewsLoading}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">
                عرض {reviews.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} تقييم
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </SectionCard>
        </div>

        <ReviewDetailPanel
          review={selectedReview}
          loading={detailLoading}
          onClose={() => setSelectedId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onResetStatus={handleResetStatus}
          onReply={handleReply}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, note, noteColor }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Icon size={16} />
        </div>
        <p className="text-xs text-primary/50 leading-tight">{title}</p>
      </div>
      <div>
        <p className="text-lg font-bold text-primary leading-none">{value}</p>
        <p className={`text-[11px] mt-1.5 font-medium ${noteColor}`}>{note}</p>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">‹</button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => typeof p === "number" && onPageChange(p)} disabled={p === "…"} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">›</button>
    </div>
  );
}