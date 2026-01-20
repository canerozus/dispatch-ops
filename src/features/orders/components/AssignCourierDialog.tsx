import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Courier, Order } from "../types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { post } from "@/api/http"
import { ordersKeys } from "../queries"
import { useState } from "react"

const assignSchema = z.object({
  courierId: z.string().min(1, "Please select a courier"),
})

interface AssignCourierDialogProps {
  orderId: string
  currentCourierId?: string
}

// Hardcoded
const MOCK_COURIERS: Courier[] = [
  { id: 'c1', name: 'Ali Veli' },
  { id: 'c2', name: 'Ayşe Yılmaz' },
  { id: 'c3', name: 'Mehmet Demir' },
]

export function AssignCourierDialog({ orderId, currentCourierId }: AssignCourierDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      courierId: currentCourierId || "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof assignSchema>) => // 1. Asıl işlem (API isteği)
      post<Order>(`/api/orders/${orderId}/assign`, data),
    // 2. İstek atıldığı an (sunucudan cevap gelmeden hemen önce) çalışır
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ordersKeys.detail(orderId) })
      // Mevcut veriyi saklıyoruz (hata olursa geri dönebilmek için)
      const previousOrder = queryClient.getQueryData<Order>(ordersKeys.detail(orderId))

      if (previousOrder) {
        // 3. Cache'i MANUEL olarak güncelle (Sanki sunucu başarılı demiş gibi)
        // Ekranda anında "Assigned" yazar ve kurye adı görünür.
        queryClient.setQueryData<Order>(ordersKeys.detail(orderId), {
            ...previousOrder,
            courierId: newData.courierId,
            status: 'assigned',
            events: [
                { at: new Date().toISOString(), status: 'assigned', note: 'Optimistic assignment' },
                ...previousOrder.events
            ]
        })
      }
      return { previousOrder }
    },
    // 4. Eğer hata olursa, eski veriyi (previousOrder) geri yükle
    onError: (_err, _newData, context) => {
        if (context?.previousOrder) {

            queryClient.setQueryData(ordersKeys.detail(orderId), context.previousOrder)
        }
    },
    // 5. İşlem bittiğinde (başarılı veya hatalı) verinin en güncel halini sunucudan çek
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ordersKeys.all })
        setOpen(false)
    }
  })

  function onSubmit(data: z.infer<typeof assignSchema>) {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button variant="outline">Assign Courier</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Courier</DialogTitle>
          <DialogDescription>
            Select a courier to assign to this order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Courier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a courier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_COURIERS.map((courier) => (
                        <SelectItem key={courier.id} value={courier.id}>
                          {courier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {mutation.error && <p className=" text-sm text-red-500">{mutation.error.message || "Something went wrong"}</p>}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Assigning..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
