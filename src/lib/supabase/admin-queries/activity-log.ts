import { createAdminClient } from '@/lib/supabase/admin';
import type {
  AdminActivityAction,
  AdminActivityEntityType,
  AdminActivityLog,
  MemberRole,
} from '@/lib/supabase/types';

// ── Admin Activity Log ────────────────────────────────────────────────────────

export async function createAdminActivityLogEntry(data: {
  actor_user_id: string | null;
  actor_email: string;
  actor_role: MemberRole;
  entity_type: AdminActivityEntityType;
  entity_id: string;
  entity_title: string;
  action: AdminActivityAction;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<AdminActivityLog | null> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from('admin_activity_log')
    .insert({
      actor_user_id: data.actor_user_id,
      actor_email: data.actor_email,
      actor_role: data.actor_role,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      entity_title: data.entity_title,
      action: data.action,
      summary: data.summary,
      metadata: data.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createAdminActivityLogEntry]', error.message);
    return null;
  }

  return created as AdminActivityLog;
}

export async function getAdminActivityLogForEntity(
  entityType: AdminActivityEntityType,
  entityId: string,
  limit = 8,
): Promise<AdminActivityLog[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getAdminActivityLogForEntity]', error.message);
    return [];
  }

  return (data ?? []) as AdminActivityLog[];
}

