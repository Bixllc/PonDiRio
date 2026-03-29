"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

type FormStatus =
  | { state: "idle" }
  | { state: "success" }
  | { state: "error"; message: string };

export default function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ mode: "onBlur" });

  const [status, setStatus] = useState<FormStatus>({ state: "idle" });

  const onSubmit = async (data: ContactFormData) => {
    setStatus({ state: "idle" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          message: data.message,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setStatus({ state: "error", message: json.error || "Failed to send message" });
        return;
      }

      setStatus({ state: "success" });
      reset();
    } catch {
      setStatus({ state: "error", message: "Something went wrong. Please try again." });
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email",
      value: "info@pondirio.com",
      link: "mailto:info@pondirio.com",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Phone",
      value: "+1 (876) 123-4567",
      link: "tel:+18761234567",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Location",
      value: "St. Mary, Jamaica",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Response Time",
      value: "Within 24 hours",
    },
  ];

  const inputCls =
    "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm";

  return (
    <section id="contact" className="bg-white py-24 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gray-500">
            GET IN TOUCH
          </p>
          <h2 className="mx-auto mb-6 max-w-4xl text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-gray-900">
            Plan Your Perfect Getaway
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Let us create a bespoke luxury experience tailored to your preferences. Our
            concierge team is ready to help you discover the perfect retreat.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left – Form */}
          <div>
            <Card className="border-0 p-8 shadow-lg lg:p-10">
              <div className="mb-8">
                <h3 className="mb-4 text-3xl text-gray-900">Send Us a Message</h3>
                <p className="text-gray-600">
                  Have a question or special request? We&apos;d love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Names */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <input
                      id="firstName"
                      placeholder="John"
                      {...register("firstName", {
                        required: "First name is required",
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Letters only" },
                      })}
                      className={inputCls}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <input
                      id="lastName"
                      placeholder="Doe"
                      {...register("lastName", {
                        required: "Last name is required",
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Letters only" },
                      })}
                      className={inputCls}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Enter a valid email address",
                        },
                      })}
                      className={inputCls}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\s()-]+$/,
                          message: "Numbers, +, spaces, dashes and parentheses only",
                        },
                      })}
                      className={inputCls}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your plans, questions, or special requests..."
                    {...register("message", { required: "Message is required" })}
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base outline-none transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-base text-white hover:bg-black/90 disabled:opacity-50 transition"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>

                {/* Feedback */}
                {status.state === "success" && (
                  <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">
                      Message sent! We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                )}
                {status.state === "error" && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">{status.message}</p>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Right – Contact Info + Image */}
          <div className="space-y-8">
            <Card className="border-0 p-8 shadow-lg">
              <h3 className="mb-6 text-2xl text-gray-900">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-100 p-3">{item.icon}</div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      {"link" in item && item.link ? (
                        <a
                          href={item.link}
                          className="text-gray-900 underline-offset-2 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="aspect-[4/5]">
                <img
                  src="/river1.jpg"
                  alt="Luxury resort at dusk by the pool"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
