import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCampaigns } from "@/lib/db/campaigns";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    sending: "bg-amber-100 text-amber-700",
    sent: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  const map: Record<string, string> = {
    whatsapp: "bg-emerald-100 text-emerald-700",
    sms: "bg-blue-100 text-blue-700",
    in_app: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[channel] ?? "bg-slate-100 text-slate-600"}`}>
      {channel === "whatsapp" && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      )}
      {channel.replace("_", " ")}
    </span>
  );
}

export default async function OutreachPage() {
  const campaigns = await getCampaigns();

  const rows = campaigns.map((c) => ({
    ...c,
    channel_display: <ChannelBadge channel={c.channel} />,
    status_display: <StatusBadge status={c.status} />,
    delivery: c.status === "sent"
      ? `${c.delivered_count}/${c.total_recipients} delivered`
      : "—",
    sent_display: c.sent_at ? format(new Date(c.sent_at), "MMM d, yyyy h:mm a") : "—",
    created_display: format(new Date(c.created_at), "MMM d, yyyy"),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mass Outreach</h1>
          <p className="mt-1 text-sm text-slate-500">
            Send WhatsApp broadcasts to all parents or specific classes at once.
          </p>
        </div>
        <Link href="/outreach/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats strip */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Campaigns", value: campaigns.length },
            { label: "Sent", value: campaigns.filter((c) => c.status === "sent").length },
            {
              label: "Total Delivered",
              value: campaigns.reduce((s, c) => s + c.delivered_count, 0),
            },
            {
              label: "Total Failed",
              value: campaigns.reduce((s, c) => s + c.failed_count, 0),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Send your first WhatsApp broadcast to parents"
          action={
            <Link href="/outreach/new">
              <Button>New Campaign</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={rows}
          columns={[
            { id: "title", header: "Campaign", accessorKey: "title", sortable: true },
            { id: "channel", header: "Channel", accessorKey: "channel_display" },
            { id: "target", header: "Target", accessorKey: "target" },
            { id: "status", header: "Status", accessorKey: "status_display" },
            { id: "delivery", header: "Delivery", accessorKey: "delivery" },
            { id: "sent_at", header: "Sent", accessorKey: "sent_display", sortable: true },
            { id: "created_by", header: "Created by", accessorKey: "created_by_name" },
          ]}
          keyExtractor={(row) => (row as { id: string }).id}
        />
      )}
    </div>
  );
}
