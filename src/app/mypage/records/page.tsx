import Link from "next/link";

import { deleteRaceRecordAction, saveRaceRecordAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { COURSE_TYPE_LABELS, STROKE_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getRaceRecordForUser, listRaceRecordsByUserId } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatDateShort } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const params = await readSearchParams(searchParams);
  const editId = params.get("edit");
  const message = params.get("message");
  const error = params.get("error");

  const records = await listRaceRecordsByUserId(currentUser.id);
  const editingRecord = editId ? await getRaceRecordForUser(currentUser.id, editId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BEST TIMES"
        title="ベストタイム"
        description="短水路・長水路を分けて、複数の記録を登録できます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="登録済みの記録"
          description={records.length > 0 ? "新しい順に表示しています。" : "まだ記録がありません。"}
        >
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {record.distance}m {STROKE_LABELS[record.stroke]}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {COURSE_TYPE_LABELS[record.courseType]} / {record.bestTime}
                      </p>
                    </div>
                    <StatusBadge tone="cyan">{COURSE_TYPE_LABELS[record.courseType]}</StatusBadge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    大会名: {record.meetName || "未入力"} / 日付: {formatDateShort(record.recordDate)}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/mypage/records?edit=${record.id}`}
                      className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    >
                      編集
                    </Link>
                    <form action={deleteRaceRecordAction}>
                      <input type="hidden" name="recordId" value={record.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/60 p-5 text-sm leading-7 text-slate-600">
              まだベストタイムが登録されていません。右のフォームから追加してください。
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={editingRecord ? "ベストタイムを編集" : "ベストタイムを追加"}
          description="記録の修正も同じフォームで行えます。"
        >
          <form action={saveRaceRecordAction} className="space-y-4">
            <input type="hidden" name="recordId" value={editingRecord?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="stroke" className="text-sm font-semibold text-slate-900">
                  種目
                </label>
                <select
                  id="stroke"
                  name="stroke"
                  defaultValue={editingRecord?.stroke ?? "freestyle"}
                  className={inputClassName}
                >
                  {Object.entries(STROKE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="distance" className="text-sm font-semibold text-slate-900">
                  距離
                </label>
                <select
                  id="distance"
                  name="distance"
                  defaultValue={editingRecord?.distance ?? 100}
                  className={inputClassName}
                >
                  {[50, 100, 200, 400, 800, 1500].map((distance) => (
                    <option key={distance} value={distance}>
                      {distance}m
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="courseType" className="text-sm font-semibold text-slate-900">
                  水路
                </label>
                <select
                  id="courseType"
                  name="courseType"
                  defaultValue={editingRecord?.courseType ?? "short_course"}
                  className={inputClassName}
                >
                  {Object.entries(COURSE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="bestTime" className="text-sm font-semibold text-slate-900">
                  ベストタイム
                </label>
                <input
                  id="bestTime"
                  name="bestTime"
                  defaultValue={editingRecord?.bestTime ?? ""}
                  required
                  placeholder="例: 00:54.82"
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="recordDate" className="text-sm font-semibold text-slate-900">
                記録日
              </label>
              <input
                id="recordDate"
                name="recordDate"
                type="date"
                defaultValue={editingRecord?.recordDate ?? ""}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="meetName" className="text-sm font-semibold text-slate-900">
                大会名
              </label>
              <input
                id="meetName"
                name="meetName"
                defaultValue={editingRecord?.meetName ?? ""}
                placeholder="例: 春季記録会"
                className={inputClassName}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <SubmitButton>{editingRecord ? "更新する" : "追加する"}</SubmitButton>
              {editingRecord ? (
                <Link
                  href="/mypage/records"
                  className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  新規入力に戻す
                </Link>
              ) : null}
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
