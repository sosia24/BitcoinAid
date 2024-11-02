import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');
  const type = searchParams.get('type'); // Adiciona o tipo de requisição ('day' ou 'monthly')

  // Define a URL da API com base no tipo
  let apiUrl;
  if (type === 'day') {
    apiUrl = `http://67.217.228.116:3000/api/leaderboard_donation?data=${data}`;
  } else if (type === 'monthly') {
    apiUrl = `http://67.217.228.116:3000/api/leaderboard_donation_monthly?data=${data}`;
  } else {
    return NextResponse.json({ error: 'Tipo de requisição inválido' }, { status: 400 });
  }

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao acessar a API:', error);
    return NextResponse.json({ error: 'Erro ao acessar a API' }, { status: 500 });
  }
}
