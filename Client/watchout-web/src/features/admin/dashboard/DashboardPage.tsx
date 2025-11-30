import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold mb-4">Witaj w panelu administratora</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold">Zdarzenia dzisiaj</h3>
          <p className="text-2xl mt-2">x</p>
        </Card>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold">Liczba użytkowników</h3>
          <p className="text-2xl mt-2">y</p>
        </Card>
      </div>
    </div>
  );
}
