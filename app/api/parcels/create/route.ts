import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Received parcel data:", body)

    if (!body.api_token || !body.user_guid) {
      return NextResponse.json(
        {
          success: false,
          message: "Token ou GUID manquant / الرمز أو المعرف مفقود",
        },
        { status: 401 },
      )
    }

    if (
      !body.client ||
      !body.phone ||
      !body.adresse ||
      !body.wilaya_id ||
      !body.commune ||
      !body.montant ||
      !body.produit ||
      !body.type_id ||
      !body.poids
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Champs obligatoires manquants / الحقول المطلوبة مفقودة",
        },
        { status: 400 },
      )
    }

    if (body.wilaya_id < 1 || body.wilaya_id > 58) {
      return NextResponse.json(
        {
          success: false,
          message: "Wilaya ID invalide (doit être entre 1 et 58) / معرف الولاية غير صالح",
        },
        { status: 400 },
      )
    }

    if (body.stop_desk === 1 && !body.station_code) {
      return NextResponse.json(
        {
          success: false,
          message: "Code station requis / رمز المحطة مطلوب",
        },
        { status: 400 },
      )
    }

    if (body.stock === 1 && !body.quantite) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantité requise / الكمية مطلوبة",
        },
        { status: 400 },
      )
    }

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock success response (90% success rate for testing)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: "Parcel created successfully",
        data: {
          id: `PCL${Date.now()}`,
          ...body,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de la création du colis / خطأ في إنشاء الطرد",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur / خطأ في الخادم",
      },
      { status: 500 },
    )
  }
}
