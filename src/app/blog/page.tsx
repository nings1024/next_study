import { pool } from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';

interface JiraTask extends RowDataPacket {
  JiraCode: string;
  Desc: string;
}

export default async function Blog() {
  const [rows] = await pool.query<JiraTask[]>(
    "SELECT JiraCode, `Desc` FROM jiratask j WHERE j.JiraCode = 'LIS-143980'"
  );

  if (rows.length === 0) return <div>Not found</div>;

  return (
    <>
      <h1>{rows[0].JiraCode}</h1>
      <p>{rows[0].Desc}</p>
    </>
  );
}
