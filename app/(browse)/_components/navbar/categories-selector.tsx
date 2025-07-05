"use client";

import { useCategories } from "@/hooks/use-categories";
import { Loader2, X, AlertCircle, CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import type { CategoryWithSubCategories } from "@/types/category";

interface CategoriesSelectorProps {
  selectedInterests: string[];
  setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  open: boolean;
}

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 8;

export const CategoriesSelector = ({
  selectedInterests,
  setSelectedInterests,
  open,
}: CategoriesSelectorProps) => {
  const { data: categories, isLoading: loading, error } = useCategories({
    enabled: open,
    includeInactive: false,
  });

  const handleSubCategoryToggle = (subCategoryId: string) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.includes(subCategoryId);

      if (isSelected) {
        // Allow removal if we're above minimum
        return prev.filter((id) => id !== subCategoryId);
      } else {
        // Allow addition if we're below maximum
        if (prev.length < MAX_INTERESTS) {
          return [...prev, subCategoryId];
        }
        return prev; // Don't add if at maximum
      }
    });
  };

  const removeInterest = (subCategoryId: string) => {
    setSelectedInterests((prev) => prev.filter((id) => id !== subCategoryId));
  };

  const getSelectedSubCategoryNames = () => {
    const selectedNames: { id: string; name: string; categoryName: string }[] =
      [];
    categories?.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        if (selectedInterests.includes(subCategory.id)) {
          selectedNames.push({
            id: subCategory.id,
            name: subCategory.name,
            categoryName: category.name,
          });
        }
      });
    });
    return selectedNames;
  };

  // Validation helpers
  const isAtMinimum = selectedInterests.length >= MIN_INTERESTS;
  const isAtMaximum = selectedInterests.length >= MAX_INTERESTS;
  const isValid =
    selectedInterests.length >= MIN_INTERESTS &&
    selectedInterests.length <= MAX_INTERESTS;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading categories...
        </span>
      </div>
    );
  }

  const selectedSubCategories = getSelectedSubCategoryNames();

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium font-sans">
          Select Your Interests
        </label>
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-600" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              isValid ? "text-green-600" : "text-orange-600"
            )}
          >
            {selectedInterests.length}/{MAX_INTERESTS}
          </span>
        </div>
      </div>

      {/* Selected Interests Preview */}
      {selectedSubCategories.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <h6 className="text-xs font-medium text-muted-foreground font-sans">
            Selected Interests ({selectedSubCategories.length})
          </h6>
          <div className="flex flex-wrap gap-2">
            {selectedSubCategories.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs"
              >
                <span>{interest.name}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest.id)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories and SubCategories */}
      <div className="flex flex-col mt-4 gap-y-4 max-h-[400px] overflow-y-auto">
        {categories?.map((category) => (
          <div key={category.id} className="flex flex-col gap-y-2">
            <h5 className="text-xs font-medium font-sans text-muted-foreground uppercase tracking-wide">
              {category.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {category.subCategories.map((subCategory) => {
                const isSelected = selectedInterests.includes(subCategory.id);
                const canSelect = !isSelected && !isAtMaximum;
                const isDisabled = !isSelected && isAtMaximum;

                return (
                  <span
                    key={subCategory.id}
                    onClick={() => {
                      if (isSelected || canSelect) {
                        handleSubCategoryToggle(subCategory.id);
                      }
                    }}
                    className={cn(
                      "px-3 py-2 border rounded-md text-sm transition-all duration-200",
                      "cursor-pointer select-none",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : canSelect
                        ? "bg-secondary/30 border-border text-foreground hover:bg-secondary/80"
                        : "bg-muted/30 border-muted text-muted-foreground cursor-not-allowed opacity-60"
                    )}
                    title={
                      isDisabled
                        ? `Maximum ${MAX_INTERESTS} interests allowed`
                        : undefined
                    }
                  >
                    {subCategory.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {(!categories || categories.length === 0) && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No categories available</p>
        </div>
      )}
    </div>
  );
};
