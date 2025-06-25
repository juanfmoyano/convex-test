export default function Profile(){
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<h1 className="text-3xl font-bold">Welcome to the Profile Page</h1>
				<p className="text-lg">This is a simple profile page example.</p>
			</main>
		</div>
	);
}