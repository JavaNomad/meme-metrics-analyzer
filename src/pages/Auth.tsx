import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          // Add user to Mailchimp when they confirm their email
          if (session?.user.email && session.user.email_confirmed_at) {
            try {
              const { error } = await supabase.functions.invoke('add-to-mailchimp', {
                body: { email: session.user.email },
              });
              
              if (error) {
                console.error('Error adding to Mailchimp:', error);
                toast({
                  title: "Error",
                  description: "Failed to add email to mailing list",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Success",
                  description: "Added to mailing list successfully",
                });
              }
            } catch (error) {
              console.error('Error adding to Mailchimp:', error);
              toast({
                title: "Error",
                description: "Failed to add email to mailing list",
                variant: "destructive",
              });
            }
          }
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Base Meme Token Analyzer</h1>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </Card>
    </div>
  );
};

export default Auth;