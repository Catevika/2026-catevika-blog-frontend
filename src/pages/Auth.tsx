import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/useAuthForm";
import { formatCooldown } from "@/utils/formatCooldown";
import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { TbLockPassword } from "react-icons/tb";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useNavigate } from "react-router";

export default function Auth() {
  const {
    mode,
    values,
    fieldErrors,
    globalError,
    cooldown,
    rememberMe,
    handleChange,
    handleSubmit,
    handleRememberMeChange,
    toggleMode,
  } = useAuthForm();

  const navigate = useNavigate();

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    const ok = await handleSubmit(e);
    if (ok) void navigate("/");
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full mx-auto mt-10 max-w-2/3 md:max-w-1/3">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === "signup" ? "Create an account" : "Login"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "signup"
            ? "Start writing and managing your blog posts today."
            : "Access your dashboard and manage your blog posts."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(e);
          }}
          className="space-y-4"
          noValidate
          autoComplete="off"
          method="post"
        >
          {globalError && (
            <p className="text-sm text-center text-red-500">{globalError}</p>
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">
                <HiOutlineUserCircle size={18} /> Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Name"
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-500">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              <HiOutlineMail size={18} /> Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="Email"
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              <TbLockPassword size={18} /> Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="********"
                className="pr-10"
                aria-invalid={!!fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute -translate-y-1/2 right-2 top-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <VscEyeClosed size={18} />
                ) : (
                  <VscEye size={18} />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {mode === "login" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
              />
              <Label htmlFor="remember">Remember me</Label>
            </div>
          )}

          <Button type="submit" className="w-full">
            {mode === "signup" ? "Sign up" : "Login"}
          </Button>
        </form>
      </CardContent>
      {cooldown !== null && (
        <p className="mt-2 text-sm text-center text-red-500">
          Try again in {formatCooldown(cooldown)}.
        </p>
      )}

      <CardFooter>
        <Button variant="ghost" className="w-full" onClick={toggleMode}>
          {mode === "signup"
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </Button>
      </CardFooter>
    </Card>
  );
}
