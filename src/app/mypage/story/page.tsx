import { saveStoryAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { VISIBILITY_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getStoryByUserId } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function StoryPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const story = await getStoryByUserId(currentUser.id);
  const params = await readSearchParams(searchParams);
  const message = params.get("message");
  const error = params.get("error");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SWIM STORY"
        title="私の競泳物語"
        description="過去、今、未来を言葉にすると、目標の意味が見えやすくなります。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard
        title="物語を書く"
        description="1つずつ短く書いても大丈夫です。あとで何度でも書き直せます。"
      >
        <form action={saveStoryAction} className="space-y-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-cyan-600">過去</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">ここまでの競泳人生をふり返る</h3>
            </div>
            {[
              ["oldestMemory", "1. 水泳に関する一番古い記憶は？", story?.oldestMemory ?? ""],
              ["reasonStarted", "2. 水泳を始めたきっかけは？", story?.reasonStarted ?? ""],
              ["firstRaceMemory", "3. 初めて大会に出場したときの思い出は？", story?.firstRaceMemory ?? ""],
              [
                "memorableEvent",
                "4. 心に残っていることや、今の自分に大きな影響を与えたことは？",
                story?.memorableEvent ?? "",
              ],
            ].map(([name, label, value]) => (
              <div key={name} className="space-y-2">
                <label htmlFor={name} className="text-sm font-semibold text-slate-900">
                  {label}
                </label>
                <textarea id={name} name={name} rows={4} defaultValue={String(value)} required className={inputClassName} />
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-cyan-600">今</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">今の自分にとっての競泳を書く</h3>
            </div>
            {[
              ["reasonContinuing", "5. 競泳を続けている理由は？", story?.reasonContinuing ?? ""],
              ["growthMoment", "6. どんなときに技術や心の成長を感じている？", story?.growthMoment ?? ""],
              [
                "meaningOfSwimming",
                "7. 今のあなたにとって競泳とは？どんな意味・価値をもつ？",
                story?.meaningOfSwimming ?? "",
              ],
            ].map(([name, label, value]) => (
              <div key={name} className="space-y-2">
                <label htmlFor={name} className="text-sm font-semibold text-slate-900">
                  {label}
                </label>
                <textarea id={name} name={name} rows={4} defaultValue={String(value)} required className={inputClassName} />
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-cyan-600">未来</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">未来の景色を思い描く</h3>
            </div>
            {[
              ["continueUntilAge", "8. 「私の競泳物語」は何歳まで続く？", story?.continueUntilAge ?? ""],
              [
                "lastScene",
                "9. ラストシーンで目の前に広がる光景は？",
                story?.lastScene ?? "",
              ],
              [
                "whoToShow",
                "10. 完成までの過程や完成版は誰に見てほしい？",
                story?.whoToShow ?? "",
              ],
            ].map(([name, label, value]) => (
              <div key={name} className="space-y-2">
                <label htmlFor={name} className="text-sm font-semibold text-slate-900">
                  {label}
                </label>
                <textarea id={name} name={name} rows={4} defaultValue={String(value)} required className={inputClassName} />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="visibility" className="text-sm font-semibold text-slate-900">
              管理者に見せるか
            </label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={story?.visibility ?? "private"}
              className={inputClassName}
            >
              {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <SubmitButton>競泳物語を保存する</SubmitButton>
        </form>
      </SectionCard>
    </div>
  );
}
