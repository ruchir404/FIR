import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { lat, lng } = await req.json()

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json
    ?location=${lat},${lng}
    &radius=5000
    &type=police
    &key=${process.env.GOOGLE_MAPS_API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.results?.length) {
    return NextResponse.json({ error: 'No police station found' }, { status: 404 })
  }

  const nearest = data.results[0]

  return NextResponse.json({
    name: nearest.name,
    address: nearest.vicinity,
  })
}
