import { useState } from "react";
import { 
  Globe, 
  FileText, 
  Activity, 
  Search, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Volume2,
  Download,
  Copy,
  Star,
  Code,
  LayoutTemplate
} from "lucide-react";
import { clsx } from "clsx";
import { analyzeContent, generateTTS } from "../services/gemini";
import ReactMarkdown from "react-markdown";
import { Chatbot } from "../components/Chatbot";

export function Audit() {
  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setAudioUrl(null);
    try {
      const data = await analyzeContent(activeTab === "url" ? url : text, "full");
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Mock result for demo if API fails or for testing UI
      setResult({
        seo_diagnosis: {
          score: 78,
          issues: ["Missing meta descriptions", "Slow load time"],
          strengths: ["Good mobile responsiveness"],
          reviews: {
            rating: 4.2,
            count: 128,
            impact_analysis: "A rating of 4.2 is good but falls below the 4.5 threshold often preferred by users. 128 reviews show established presence."
          },
          content_audit: {
            h1: "Best Medical Clinic in Madrid",
            services_found: ["General Medicine", "Pediatrics", "Dermatology"],
            suggestions: ["Include city name in H1 more naturally", "Add individual service pages"]
          }
        },
        geo_diagnosis: {
          score: 65,
          schema_detected: false,
          schema_types: [],
          schema_analysis: "No JSON-LD schema detected. This severely limits AI understanding of your business details.",
          entity_clarity: "Moderate",
          missing_data: ["Service hours", "Price range"]
        },
        sales_pitch: {
          package_1_seo: "Fix your technical SEO foundation to boost visibility.",
          package_2_geo: "Implement structured data to rank in AI answers.",
          package_3_bundle: "Complete dominance: SEO + GEO optimization."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!result) return;
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      return;
    }

    try {
      const textToRead = `Here is your audit report. Your SEO score is ${result.seo_diagnosis.score} and your GEO score is ${result.geo_diagnosis.score}. ${result.sales_pitch.package_3_bundle}`;
      const base64 = await generateTTS(textToRead);
      if (base64) {
        const url = `data:audio/mp3;base64,${base64}`;
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.play();
        setPlaying(true);
        audio.onended = () => setPlaying(false);
      }
    } catch (error) {
      console.error("TTS failed:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">New Audit</h1>
        <p className="text-slate-500">Analyze your content for SEO and GEO optimization</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("url")}
            className={clsx(
              "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              activeTab === "url" ? "bg-slate-50 text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Globe size={18} /> Analyze URL
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={clsx(
              "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              activeTab === "text" ? "bg-slate-50 text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <FileText size={18} /> Paste Text
          </button>
          <button
            onClick={() => setActiveTab("site")}
            className={clsx(
              "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              activeTab === "site" ? "bg-slate-50 text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Activity size={18} /> Site Audit
          </button>
        </div>

        <div className="p-8">
          {activeTab === "url" && (
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ZapIcon />}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          )}
          
          {activeTab === "text" && (
            <div className="space-y-4">
              <textarea
                placeholder="Paste your content here..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[200px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !text}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ZapIcon />}
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard 
              title="SEO Score" 
              score={result.seo_diagnosis.score} 
              description="Traditional Search Engine Optimization"
              color="blue"
            />
            <ScoreCard 
              title="GEO Score" 
              score={result.geo_diagnosis.score} 
              description="Generative Engine Optimization (AI)"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Reviews & Ratings */}
              {result.seo_diagnosis.reviews && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    Reviews & Reputation
                  </h3>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{result.seo_diagnosis.reviews.rating || "N/A"}</div>
                      <div className="text-xs text-slate-500">Average Rating</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{result.seo_diagnosis.reviews.count || "0"}</div>
                      <div className="text-xs text-slate-500">Total Reviews</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                    {result.seo_diagnosis.reviews.impact_analysis}
                  </p>
                </div>
              )}

              {/* Content Audit */}
              {result.seo_diagnosis.content_audit && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate className="text-blue-500" size={20} />
                    Content Audit
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Main Heading (H1)</span>
                      <p className="font-medium text-slate-900 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        {result.seo_diagnosis.content_audit.h1 || "No H1 detected"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Detected Services</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.seo_diagnosis.content_audit.services_found?.map((service: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {service}
                          </span>
                        )) || <span className="text-sm text-slate-500">No services detected</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Suggestions</span>
                      <ul className="mt-2 space-y-2">
                        {result.seo_diagnosis.content_audit.suggestions?.map((suggestion: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span> {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Schema Analysis */}
              {result.geo_diagnosis && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Code className="text-purple-500" size={20} />
                    Schema Markup Analysis
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
                      result.geo_diagnosis.schema_detected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {result.geo_diagnosis.schema_detected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {result.geo_diagnosis.schema_detected ? "Schema Detected" : "No Schema Detected"}
                    </div>
                    {result.geo_diagnosis.schema_types?.map((type: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                    {result.geo_diagnosis.schema_analysis}
                  </p>
                </div>
              )}

              {/* Issues & Opportunities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  Issues & Opportunities
                </h3>
                <div className="space-y-4">
                  {result.seo_diagnosis.issues.map((issue: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {issue}
                    </div>
                  ))}
                  {result.geo_diagnosis.missing_data.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
                      <Activity size={16} className="mt-0.5 shrink-0" />
                      Missing for AI: {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  Strengths
                </h3>
                <div className="space-y-4">
                  {result.seo_diagnosis.strengths.map((strength: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg sticky top-6">
                <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-blue-300 uppercase font-bold mb-1">SEO Package</div>
                    <p className="text-sm">{result.sales_pitch.package_1_seo}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-purple-500/50">
                    <div className="text-xs text-purple-300 uppercase font-bold mb-1">GEO Package (AI-Ready)</div>
                    <p className="text-sm">{result.sales_pitch.package_2_geo}</p>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors">
                  Generate Proposal
                </button>
              </div>

              {/* Tools */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                <button 
                  onClick={handleTTS}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {playing ? <Volume2 className="animate-pulse text-blue-600" /> : <Volume2 />}
                  {playing ? "Playing Report..." : "Listen to Report"}
                </button>
                <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors flex items-center justify-center gap-2">
                  <Download size={20} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Chatbot contextData={result} />
    </div>
  );
}

function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}

function ScoreCard({ title, score, description, color }: any) {
  const colors = {
    blue: "text-blue-600",
    purple: "text-purple-600",
  };
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-[200px]">{description}</p>
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            className={`${colors[color as keyof typeof colors]} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${colors[color as keyof typeof colors]}`}>
          {score}%
        </span>
      </div>
    </div>
  );
}
