import React, { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export default function AddContactModal({ isOpen, onClose, children }: AddContactModalProps) {
  const contactTypes = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
  ];
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // prevent default form submission
    // TODO: wire up form submission
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Add Contact
                </Dialog.Title>
                <div className="mt-2">
                  {children ?? (
                    <Form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <InputField id="name" name="name" placeholder="Full Name" />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          options={contactTypes}
                          placeholder="Select Contact Type"
                          onChange={() => {}}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <InputField type="tel" id="phone" name="phone" placeholder="Phone Number" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <InputField type="email" id="email" name="email" placeholder="Email Address" />
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <InputField id="licenseNumber" name="licenseNumber" placeholder="License Number" />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button type="submit">Add Contact</Button>
                      </div>
                    </Form>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 