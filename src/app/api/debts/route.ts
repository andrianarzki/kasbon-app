import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateDebtInput } from '@/lib/validations';
import { Debt, DebtInsert } from '@/types/database';

// GET /api/debts (terima query ?status= &type=)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status'); // 'all' | 'belum' | 'lunas' | 'unsettled' | 'settled'
    const typeParam = searchParams.get('type'); // 'all' | 'dihutang' | 'hutang' | 'owed_to_me' | 'i_owe'

    let query = supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter status
    if (statusParam === 'belum' || statusParam === 'unsettled') {
      query = query.is('settled_at', null);
    } else if (statusParam === 'lunas' || statusParam === 'settled') {
      query = query.not('settled_at', 'is', null);
    }

    // Filter type
    if (typeParam === 'dihutang' || typeParam === 'owed_to_me') {
      query = query.eq('type', 'owed_to_me');
    } else if (typeParam === 'hutang' || typeParam === 'i_owe') {
      query = query.eq('type', 'i_owe');
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Gagal mengambil data kasbon: ${error.message}` },
        { status: 500 }
      );
    }

    const debts: Debt[] = (data || []) as Debt[];

    return NextResponse.json(debts, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server';
    return NextResponse.json(
      { error: `Terjadi kendala server: ${message}` },
      { status: 500 }
    );
  }
}

// POST /api/debts (Create entry baru)
export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Permintaan data tidak valid (body JSON kosong).' },
        { status: 400 }
      );
    }

    const debtData: Partial<DebtInsert> = {
      type: body.type,
      counterpart_name: typeof body.counterpart_name === 'string' ? body.counterpart_name.trim() : '',
      amount: Number(body.amount),
      note: typeof body.note === 'string' ? body.note.trim() : null,
      due_date: body.due_date ? String(body.due_date) : null,
      settled_at: body.settled_at ? String(body.settled_at) : null,
    };

    // Validasi input
    const validation = validateDebtInput(debtData);
    if (!validation.isValid) {
      const firstErrorMessage = Object.values(validation.errors)[0] || 'Validasi data gagal';
      return NextResponse.json(
        {
          error: firstErrorMessage,
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        type: debtData.type!,
        counterpart_name: debtData.counterpart_name!,
        amount: Math.round(debtData.amount!),
        note: debtData.note || null,
        due_date: debtData.due_date || null,
        settled_at: debtData.settled_at || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Gagal menyimpan kasbon baru: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Debt, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server';
    return NextResponse.json(
      { error: `Terjadi kendala server: ${message}` },
      { status: 500 }
    );
  }
}
