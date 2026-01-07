import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/')({
  component: TestIndex,
})

function TestIndex() {
  return (
    <div className="p-4 flex flex-col gap-1 justify-center items-center">
      <h1 className="text-2xl font-bold">Test</h1>
      <p>Test page.</p>
    </div>
  )
}
export default TestIndex