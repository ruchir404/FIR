"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, RefreshCw, MessageSquare, Download, Eye, Mic, MicOff, Volume2, Globe } from "lucide-react"

import { citizenChatbotService } from "@/lib/citizenchatbot"
import { VoiceService, textToSpeech, getTransliteration } from "@/lib/voice-service"
import { type LanguageCode, getTranslation, languageNames, LANGUAGES } from "@/lib/languages"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChatMessage, ChatSession } from "@/lib/citizenchatbot"

// -----------------------------
// Force citizen mode
// -----------------------------
const chatbotService = citizenChatbotService

export function ChatInterface () {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null)
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en")
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [voiceTranscriptTranslation, setVoiceTranscriptTranslation] = useState("")

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize voice service
  useEffect(() => {
    const service = new VoiceService(currentLanguage)
    setVoiceService(service)
    return () => {
      if (service.getIsListening()) service.stopListening()
    }
  }, [currentLanguage])

  // -----------------------------
  // Start new citizen session
  // -----------------------------
  const startNewSession = () => {
    const newSession = chatbotService.createSession()
    console.log("New Citizen Session:", newSession)
    setSession(newSession)
    setMessages([...newSession.messages])

    // Speak the first bot message (greeting)
    const firstBotMessage = newSession.messages.find((m) => m.type === "bot")
    if (firstBotMessage) {
      setTimeout(() => {
        textToSpeech(firstBotMessage.content, currentLanguage)
      }, 100)
    }
  }

  // -----------------------------
  // Handle sending user messages
  // -----------------------------
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session || isLoading) return

    setIsLoading(true)
    const userMessage = inputValue.trim()
    setInputValue("")
    setVoiceTranscript("")
    setVoiceTranscriptTranslation("")

    try {
      const updatedMessages = await chatbotService.processMessage(session.id, userMessage)
      setMessages([...updatedMessages])

      const updatedSession = chatbotService.getSession(session.id)
      if (updatedSession) setSession(updatedSession)

      // Speak the last bot message
      const lastMessage = updatedMessages[updatedMessages.length - 1]
      if (lastMessage?.type === "bot") textToSpeech(lastMessage.content, currentLanguage)
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, index, arr) => (
      <span key={index}>
        {line}
        {index < arr.length - 1 && <br />}
      </span>
    ))
  }

  const handleLanguageChange = (language: LanguageCode) => {
    setCurrentLanguage(language)
    if (voiceService) voiceService.setLanguage(language)
  }

  const startVoiceInput = () => {
    if (!voiceService) return
    setIsVoiceListening(true)
    setVoiceTranscript("")
    setVoiceTranscriptTranslation("")
    voiceService.startListening(
      (transcript, isFinal) => {
        setVoiceTranscript(transcript)
        if (isFinal) {
          setInputValue(transcript)
          if (currentLanguage !== "en" && transcript.length > 0) {
            getTransliteration(transcript, currentLanguage)
              .then((translation) => setVoiceTranscriptTranslation(translation))
              .catch(console.error)
          }
        }
      },
      (error) => {
        console.error("Voice error:", error)
        setIsVoiceListening(false)
      },
      () => setIsVoiceListening(false)
    )
  }

  const stopVoiceInput = () => {
    if (voiceService) {
      voiceService.stopListening()
      setIsVoiceListening(false)
    }
  }

  // -----------------------------
  // Citizen FIR cannot download or preview
  // -----------------------------
  const handleDownloadFIR = async () => {
    alert("Download FIR PDF is not available for citizen session.")
  }

  const handlePreviewFIR = async () => {
    alert("Preview FIR is not available for citizen session.")
  }

  useEffect(() => {
    startNewSession()
  }, [])

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col bg-black text-white">
        {/* Header */}
        <CardHeader className="flex-shrink-0 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Citizen e-FIR Chatbot</span>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {session && (
                    <Badge variant="outline" className="text-xs bg-gray-800 border-gray-700">
                      {session.currentStep}
                    </Badge>
                  )}
                  {session?.isCompleted && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[140px] bg-gray-900 text-white border-gray-700" />
                  <SelectContent>
                    <SelectItem value="en">{languageNames.en}</SelectItem>
                    <SelectItem value="hi">{languageNames.hi}</SelectItem>
                    <SelectItem value="mr">{languageNames.mr}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={startNewSession}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Content */}
        <CardContent className="flex-1 flex flex-col p-0 bg-black">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={message.type === "user" ? "bg-primary text-primary-foreground" : "bg-gray-700 text-white"}
                    >
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-gray-800 border border-gray-700"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{formatMessageContent(message.content)}</div>
                    <div className="text-xs opacity-70 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</div>
                    {message.type === "bot" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 px-2 text-white"
                        onClick={() => textToSpeech(message.content, currentLanguage)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Speak
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-700 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-800 rounded-lg p-3 text-white">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs text-white">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4 bg-gray-900">
            <div className="space-y-2">
              {voiceTranscript && (
                <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2 text-white">
                  <div>
                    <span className="text-xs font-semibold block mb-1">
                      {currentLanguage === "en" ? "Voice Input:" : `${languageNames[currentLanguage]} Input:`}
                    </span>
                    <span className="font-medium text-lg">{voiceTranscript}</span>
                  </div>
                  {voiceTranscriptTranslation && (
                    <div className="border-t border-gray-700 pt-2">
                      <span className="text-xs font-semibold block mb-1">English Translation:</span>
                      <span className="text-sm">{voiceTranscriptTranslation}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading || isVoiceListening}
                  className="flex-1 bg-gray-800 text-white border-gray-700"
                />
                <Button
                  onClick={isVoiceListening ? stopVoiceInput : startVoiceInput}
                  variant={isVoiceListening ? "destructive" : "outline"}
                  size="icon"
                  title={isVoiceListening ? "Stop listening" : "Start voice input"}
                >
                  {isVoiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Press Enter to send • Click 🎤 for voice input • This AI assistant will help you file a citizen complaint step by step
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
