import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function GET() {
  const visits = db.getVisits();
  const { technicians } = db.getUsers();
  const categories = db.getCategories();

  // Category counts (all-time)
  const categoryCounts: Record<string, number> = {};
  categories.forEach((c) => (categoryCounts[c] = 0));
  visits.forEach((v) => {
    categoryCounts[v.solutionCategory] = (categoryCounts[v.solutionCategory] ?? 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const categoryDistribution = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: visits.length ? Math.round((count / visits.length) * 1000) / 10 : 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Technician counts
  const techCounts: Record<string, number> = {};
  visits.forEach((v) => {
    techCounts[v.techCode] = (techCounts[v.techCode] ?? 0) + 1;
  });

  const topTechnicians = Object.entries(techCounts)
    .map(([techCode, count]) => {
      const tech = technicians.find((t) => t.techCode === techCode);
      return { techCode, name: tech?.name ?? techCode, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Daily trend - last 7 days
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(toDateStr(d));
  }

  const dailyTrend = days.map((date) => {
    const dayVisits = visits.filter((v) => v.visitDate === date);
    const cats: Record<string, number> = {};
    dayVisits.forEach((v) => {
      cats[v.solutionCategory] = (cats[v.solutionCategory] ?? 0) + 1;
    });
    return { date, total: dayVisits.length, categories: cats };
  });

  return NextResponse.json({
    totalVisits: visits.length,
    topCategories,
    topTechnicians,
    dailyTrend,
    categoryDistribution,
  });
}
