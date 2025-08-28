import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <section className="mb-16 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Sistem Presensi dengan Face-api.js</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Digunakan untuk melakukan evaluasi presensi melalui variabel akurasi dan latency dari model face-api.js
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="default" size="lg">
            <Link href="/register">Daftar Wajah</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/recognize">Absensi</Link>
          </Button>
        </div>
      </section>

      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-2xl">Cara Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Badge
                variant="outline"
                className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary"
              >
                <span>1</span>
              </Badge>
              <h3 className="font-medium text-lg">Daftar Wajah</h3>
              <p className="text-sm text-muted-foreground">
                Kunjungi halaman pendaftaran dan ikuti petunjuk untuk mendaftarkan wajah Anda.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Badge
                variant="outline"
                className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary"
              >
                <span>2</span>
              </Badge>
              <h3 className="font-medium text-lg">Absensi</h3>
              <p className="text-sm text-muted-foreground">
                Buka halaman absensi dan posisikan wajah Anda di depan kamera.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Badge
                variant="outline"
                className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary"
              >
                <span>3</span>
              </Badge>
              <h3 className="font-medium text-lg">Verifikasi</h3>
              <p className="text-sm text-muted-foreground">
                Sistem akan otomatis mengenali wajah Anda dan mencatat kehadiran.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center border-t border-border pt-8">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Sistem Absensi dengan Pengenalan Wajah
        </p>
        <p className="text-muted-foreground/70 text-xs mt-1">Dibuat dengan Next.js dan Face-API.js</p>
      </footer>
    </main>
  )
}
