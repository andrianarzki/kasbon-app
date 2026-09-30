import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Debt, DebtUpdate } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/debts/[id] (Update termasuk tandai lunas)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi tidak disertakan.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Body request JSON tidak valid.' },
        { status: 400 }
      );
    }

    // Verify existence & ownership
    const { data: existing, error: findError } = await supabase
      .from('debts')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: `Gagal mencari kasbon: ${findError.message}` },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Catatan kasbon tidak ditemukan atau kamu tidak memiliki akses.' },
        { status: 404 }
      );
    }

    const updates: DebtUpdate = {};

    if ('type' in body) {
      if (body.type !== 'owed_to_me' && body.type !== 'i_owe') {
        return NextResponse.json(
          { error: 'Tipe transaksi harus bernilai "owed_to_me" atau "i_owe".' },
          { status: 400 }
        );
      }
      updates.type = body.type;
    }

    if ('counterpart_name' in body) {
      const name = String(body.counterpart_name || '').trim();
      if (!name) {
        return NextResponse.json(
          { error: 'Nama orang tidak boleh kosong.' },
          { status: 400 }
        );
      }
      updates.counterpart_name = name;
    }

    if ('amount' in body) {
      const amt = Number(body.amount);
      if (!Number.isInteger(amt) || amt <= 0) {
        return NextResponse.json(
          { error: 'Nominal harus berupa angka bulat positif (Rupiah utuh).' },
          { status: 400 }
        );
      }
      updates.amount = amt;
    }

    if ('note' in body) {
      const noteStr = body.note === null ? null : String(body.note).trim();
      if (noteStr && noteStr.length > 200) {
        return NextResponse.json(
          { error: 'Catatan maksimal 200 karakter.' },
          { status: 400 }
        );
      }
      updates.note = noteStr;
    }

    if ('due_date' in body) {
      updates.due_date = body.due_date ? String(body.due_date) : null;
    }

    // Support toggle status lunas (settled_at: ISO timestamp or null)
    if ('settled_at' in body) {
      updates.settled_at = body.settled_at ? String(body.settled_at) : null;
    }

    const { data: updated, error: updateError } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Gagal memperbarui catatan: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(updated as Debt, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kendala pada server';
    return NextResponse.json(
      { error: `Terjadi kendala server: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/debts/[id] (Hapus entry)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi tidak disertakan.' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: `Gagal menghapus catatan: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Catatan kasbon berhasil dihapus.' },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kendala pada server';
    return NextResponse.json(
      { error: `Terjadi kendala server: ${message}` },
      { status: 500 }
    );
  }
}
