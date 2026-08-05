import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../context/AuthContext';
import { useCreateOrder } from '../hooks';
import { CargoType, PaymentMethod, CARGO_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../../../constants/enums';
import { Input, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

const cargoSchema = z.object({
  description: z.string().min(2, 'Description is required.'),
  cargoType: z.nativeEnum(CargoType, { required_error: 'Select cargo type.' }),
  weightKg: z.coerce.number().positive('Weight must be greater than 0.').max(50000, 'Weight cannot exceed 50,000 kg.'),
  dimensions: z.object({
    lengthCm: z.coerce.number().positive('Length is required.'),
    widthCm: z.coerce.number().positive('Width is required.'),
    heightCm: z.coerce.number().positive('Height is required.'),
  }),
});

const schema = z.object({
  origin: z.string().min(3, 'Origin must be at least 3 characters.'),
  destination: z.string().min(3, 'Destination must be at least 3 characters.'),
  cargoItems: z.array(cargoSchema).min(1, 'Add at least one cargo item.'),
  paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Please select a payment method.' }),
});

type FormData = z.infer<typeof schema>;

const emptyCargo = {
  description: '',
  cargoType: CargoType.STANDARD,
  weightKg: 0,
  dimensions: { lengthCm: 0, widthCm: 0, heightCm: 0 },
};

export function NewOrderPage() {
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      origin: '',
      destination: '',
      cargoItems: [emptyCargo],
      paymentMethod: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'cargoItems' });
  const cargoItems = watch('cargoItems') ?? [];
  const totalWeight = cargoItems.reduce((sum, item) => sum + (Number(item.weightKg) || 0), 0);
  const estimatedTotal = totalWeight > 0 ? totalWeight * 3.5 + 50 : 0;

  const onSubmit = async (data: FormData) => {
    if (!loggedInUser) return;
    await createOrder.mutateAsync({ ...data, customerId: loggedInUser.id });
    navigate('/customer');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[#4B7084] hover:text-[#183446] hover:bg-[#E4F5FB] rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="font-display text-3xl font-bold text-[#183446]">New Order</h2>
          <p className="text-sm text-[#4B7084]">Create an order with one or more measured cargo items.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="origin" label="Origin" placeholder="Melbourne, VIC" {...register('origin')} error={errors.origin?.message} />
            <Input id="destination" label="Destination" placeholder="Sydney, NSW" {...register('destination')} error={errors.destination?.message} />
          </div>

          <div className="space-y-4 border-t border-[#B7D9E5] pt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-[#183446]">Cargo Items</h3>
              <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyCargo)}>
                Add Cargo
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border border-[#B7D9E5] bg-[#F1F9FC] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-semibold text-[#183446]">CARGO-{String(index + 1).padStart(2, '0')}</p>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>Remove</Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Description"
                    {...register(`cargoItems.${index}.description`)}
                    error={errors.cargoItems?.[index]?.description?.message}
                  />
                  <Select
                    label="Cargo Type"
                    {...register(`cargoItems.${index}.cargoType`)}
                    error={errors.cargoItems?.[index]?.cargoType?.message}
                  >
                    {Object.entries(CARGO_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    min="0.1"
                    {...register(`cargoItems.${index}.weightKg`)}
                    error={errors.cargoItems?.[index]?.weightKg?.message}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Length (cm)" type="number" min="1" {...register(`cargoItems.${index}.dimensions.lengthCm`)} error={errors.cargoItems?.[index]?.dimensions?.lengthCm?.message} />
                  <Input label="Width (cm)" type="number" min="1" {...register(`cargoItems.${index}.dimensions.widthCm`)} error={errors.cargoItems?.[index]?.dimensions?.widthCm?.message} />
                  <Input label="Height (cm)" type="number" min="1" {...register(`cargoItems.${index}.dimensions.heightCm`)} error={errors.cargoItems?.[index]?.dimensions?.heightCm?.message} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 border-t border-[#B7D9E5] pt-5 items-end">
            <Select
              id="paymentMethod"
              label="Payment Method"
              {...register('paymentMethod')}
              error={errors.paymentMethod?.message}
            >
              <option value="">Select payment method</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <div className="rounded-md border border-[#B7D9E5] bg-[#E4F5FB] px-4 py-3 min-w-56">
              <p className="text-xs text-[#4B7084]">Estimated total</p>
              <p className="font-mono text-lg font-semibold text-[#183446]">
                {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(estimatedTotal)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/customer')}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting || createOrder.isPending} disabled={!isValid}>
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
