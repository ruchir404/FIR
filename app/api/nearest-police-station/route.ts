import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json()
    console.log("📡 Incoming coords:", lat, lng)

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=police&key=${process.env.GOOGLE_MAPS_API_KEY}`

    const res = await fetch(url)
    const data = await res.json()

    console.log("📡 Google response status:", data.status)

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        { error: data.status || "No police station found" },
        { status: 400 }
      )
    }

    const nearest = data.results[0]

    return NextResponse.json({
      name: nearest.name,
      address: nearest.vicinity,
    })
  } catch (err) {
    console.error("❌ API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
