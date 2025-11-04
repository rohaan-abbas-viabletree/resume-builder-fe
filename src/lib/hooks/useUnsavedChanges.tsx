import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useBreadCrumb } from "../store/useBreadcrumbs";

const useUnsavedChanges = () => {
  const router = useRouter();
  //   const setShouldReset = useBreadCrumb((state) => state.setShouldReset);
  const [formValuesChange, setFormValuesChange] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formValuesChange) {
        e.preventDefault();
        return (e.returnValue = true);
      }
    };

    const handleRouteChange = () => {
      if (formValuesChange) {
        const confirmLeave = confirm("Changes you made may not be saved.");
        if (!confirmLeave) {
          //   setShouldReset(false);
          return false; // Prevent route change
        }
      }
      return true; // Allow route change
    };

    // Add `beforeunload` listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Override router.push
    const originalPush = router.push;
    router.push = (url: string) => {
      const shouldProceed = handleRouteChange();
      if (shouldProceed) {
        return originalPush(url);
      }
      return false;
    };

    // Cleanup: Remove event listeners and restore original push
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.push = originalPush;
    };
  }, [formValuesChange, router]);

  // Function to set form value change state
  const setFormValueChange = (value: boolean) => {
    setFormValuesChange(value);
  };

  return {
    formValuesChange,
    setFormValueChange,
  };
};

export default useUnsavedChanges;
