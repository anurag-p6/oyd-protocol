import Image from 'next/image';

export default function Logo() {
  return (
    <>
      <div className="flex items-center">
        <Image src="/logo.svg" alt="Data DAO Logo" width={40} height={40} />
        <h1 className="text-xl font-bold text-slate-900">
          <span className="text-blue-600">OYD</span> Protocol
        </h1>
      </div>
    </>
  );
}