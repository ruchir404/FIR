"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Scale, Filter, ChevronDown, ChevronUp } from "lucide-react"
import {
  searchBNSSections,
  getAllBNSSectionsSorted,
  getAllBNSCategories,
  getBNSSectionsByCategory,
  type BNSSection,
} from "@/lib/bns-data"

export function BNSReference() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("search")

  const categories = useMemo(() => getAllBNSCategories(), [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchBNSSections(searchQuery)
  }, [searchQuery])

  const categoryResults = useMemo(() => {
    if (!selectedCategory) return []
    return getBNSSectionsByCategory(selectedCategory)
  }, [selectedCategory])

  const allSections = useMemo(() => getAllBNSSectionsSorted(), [])

  const BNSCard = ({
    section,
    isExpanded,
    onToggle,
  }: {
    section: BNSSection
    isExpanded: boolean
    onToggle: () => void
  }) => (
    <Card className="mb-3 cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={onToggle}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-lg text-white">{section.section_number}</h3>
                <p className="text-sm font-semibold text-blue-300 mt-1">{section.title}</p>
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* DESCRIPTION */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">DESCRIPTION</p>
            <p className="text-sm leading-relaxed text-gray-300">
              {section.description}
            </p>
          </div>
          {/* EXPLANATION */}
          {section.explanation && section.explanation.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 mb-1">EXPLANATION</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {section.explanation.map((exp, idx) => (
                  <li key={idx}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ILLUSTRATIONS */}
          {section.illustration && section.illustration.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 mb-1">ILLUSTRATIONS</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {section.illustration.map((ill, idx) => (
                  <li key={idx}>{ill}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SUB SECTIONS */}
          {section.sub_sections && section.sub_sections.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-400">SUB SECTIONS</p>

              {section.sub_sections.map((ss, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2"
                >
                  {ss.sub_section && (
                    <p className="text-sm font-semibold text-blue-300">
                      {ss.sub_section}
                    </p>
                  )}

                  {ss.description && (
                    <p className="text-sm text-gray-300">
                      {ss.description}
                    </p>
                  )}

                  {ss.punishment && (
                    <p className="text-sm bg-red-900/30 p-2 rounded border border-red-900 text-red-200">
                      {ss.punishment}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
                    {ss.cognizable && (
                      <div>
                        <span className="text-gray-500">Cognizable</span>
                        <div className="font-semibold">{ss.cognizable}</div>
                      </div>
                    )}
                    {ss.bailable && (
                      <div>
                        <span className="text-gray-500">Bailable</span>
                        <div className="font-semibold">{ss.bailable}</div>
                      </div>
                    )}
                    {ss.court && (
                      <div>
                        <span className="text-gray-500">Court</span>
                        <div className="font-semibold">{ss.court}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION LEVEL PUNISHMENT */}
          {section.punishment && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">PUNISHMENT</p>
              <p className="text-sm bg-red-900/30 p-3 rounded border border-red-900 text-red-200">
                {section.punishment}
              </p>
            </div>
          )}

          {/* KEYWORDS */}
          {section.keywords && section.keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">KEYWORDS</p>
              <div className="flex flex-wrap gap-2">
                {section.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* METADATA */}
          {(section.cognizable || section.bailable || section.court) && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-700">
              {section.cognizable && (
                <div>
                  <p className="text-xs text-gray-500">Cognizable</p>
                  <p className="text-sm font-semibold text-gray-300">{section.cognizable}</p>
                </div>
              )}
              {section.bailable && (
                <div>
                  <p className="text-xs text-gray-500">Bailable</p>
                  <p className="text-sm font-semibold text-gray-300">{section.bailable}</p>
                </div>
              )}
              {section.court && (
                <div>
                  <p className="text-xs text-gray-500">Court</p>
                  <p className="text-sm font-semibold text-gray-300">{section.court}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )

  return (
    <div className="min-h-screen flex flex-col space-y-6 bg-black text-white p-6">
      <div>
        <h2 className="text-2xl font-bold">BNS Reference</h2>
        <p className="text-gray-400">Browse and search all Bharatiya Nyaya Sanhita sections</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="search"><Search className="h-4 w-4" /> Search</TabsTrigger>
          <TabsTrigger value="browse"><Filter className="h-4 w-4" /> By Category</TabsTrigger>
          <TabsTrigger value="all"><BookOpen className="h-4 w-4" /> All</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="flex-1 flex flex-col mt-4">
          <Input
            placeholder="Search BNS sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="flex-1 mt-4">
            {searchResults.map((s) => (
              <BNSCard
                key={s.section_number}
                section={s}
                isExpanded={expandedSection === s.section_number}
                onToggle={() =>
                  setExpandedSection(expandedSection === s.section_number ? null : s.section_number)
                }
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* BROWSE TAB */}
        <TabsContent value="browse" className="flex-1 flex flex-col mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <Button key={c} onClick={() => setSelectedCategory(c)}>{c}</Button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {categoryResults.map((s) => (
              <BNSCard
                key={s.section_number}
                section={s}
                isExpanded={expandedSection === s.section_number}
                onToggle={() =>
                  setExpandedSection(expandedSection === s.section_number ? null : s.section_number)
                }
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* ALL TAB */}
        <TabsContent value="all" className="flex-1 flex flex-col mt-4">
          <ScrollArea className="flex-1">
            {allSections.map((s) => (
              <BNSCard
                key={s.section_number}
                section={s}
                isExpanded={expandedSection === s.section_number}
                onToggle={() =>
                  setExpandedSection(expandedSection === s.section_number ? null : s.section_number)
                }
              />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
