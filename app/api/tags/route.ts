import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name")
      .order("name")

    if (error) throw error

    return NextResponse.json(tags)
  } catch (error) {
    console.error("タグの取得に失敗しました:", error)
    return NextResponse.json({ error: "タグの取得に失敗しました" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from("tags")
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("タグの作成に失敗しました:", error)
    return NextResponse.json(
      { error: "タグの作成に失敗しました" },
      { status: 500 }
    )
  }
}
