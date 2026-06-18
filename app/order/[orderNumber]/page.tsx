import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { LICENSE_INFO } from "@/lib/licenses";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="container" style={{ paddingTop: "60px", paddingLeft: "20px", paddingRight: "20px", paddingBottom: "120px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <CheckCircle2 size={56} color="var(--primary)" style={{ marginBottom: "16px" }} />
          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>Siparişiniz Alındı!</h1>
          <p style={{ color: "var(--muted)" }}>
            Sipariş No: <strong>{order.orderNumber}</strong>
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "30px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: 600 }}>Satın Alınan Beatler</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {order.items.map((item) => {
              const info = LICENSE_INFO[item.licenseType];
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: "13px" }}>{info.label} Lisans • ₺{item.price.toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <a
                      href={item.downloadUrl}
                      download
                      className="btn-primary"
                      style={{ padding: "10px 16px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Download size={16} /> Ses Dosyası
                    </a>
                    <a
                      href={info.tr}
                      download
                      className="btn-outline"
                      style={{ padding: "10px 16px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <FileText size={16} /> Lisans (TR)
                    </a>
                    <a
                      href={info.en}
                      download
                      className="btn-outline"
                      style={{ padding: "10px 16px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <FileText size={16} /> Lisans (EN)
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {order.discountCode && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)", fontSize: "13px", color: "var(--muted)" }}>
              <span>Ara Toplam</span>
              <span style={{ textDecoration: "line-through" }}>
                ₺{order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </span>
            </div>
          )}
          {order.discountCode && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px", color: "#10b981" }}>
              <span>Kupon ({order.discountCode})</span>
              <span>Uygulandı</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: order.discountCode ? "10px" : "24px",
              paddingTop: order.discountCode ? "0" : "20px",
              borderTop: order.discountCode ? "none" : "1px solid var(--border)",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            <span>Toplam</span>
            <span>₺{order.total.toFixed(2)}</span>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "13px", marginTop: "20px" }}>
          Bu demo bir ödeme akışıdır; gerçek bir ödeme alınmamıştır. Dosyalarınızı yukarıdaki bağlantılardan indirebilirsiniz.
        </p>
      </div>
    </main>
  );
}
