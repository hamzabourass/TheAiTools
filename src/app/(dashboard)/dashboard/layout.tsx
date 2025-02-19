import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div >
      <main >
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                <SidebarTrigger className="-ml-1" />
                  {children}
                </SidebarInset>
              </SidebarProvider>
      </main>
    </div>
  );
}