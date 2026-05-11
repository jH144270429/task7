import Link from "next/link"
import Image from "next/image"
import { StoryHero } from "@/components/farm/StoryHero"
import { FarmMap } from "@/components/farm/FarmMap"
import { Card } from "@/components/ui/Card"
import { ButtonLink } from "@/components/ui/Button"
import { getCatalog } from "@/lib/catalog"
import { getPublicEnv } from "@/lib/env"

export default async function HomePage() {
  const catalog = await getCatalog()
  const categories = catalog.categories
  const regions = catalog.farmRegions
  const { skincareUrl } = getPublicEnv()

  return (
    <div className="flex flex-col gap-14">
      <StoryHero />
      <FarmMap regions={regions} />

      <section className="mt-2">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Shop by category
            </h2>
            <p className="mt-2 text-sm text-zinc-700">
              Chicken, eggs and woodcraft are local pickup. Skincare ships via
              Lisa’s shop.
            </p>
          </div>
          <ButtonLink href="/products" variant="secondary" className="shrink-0">
            View all
          </ButtonLink>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.slug} className="p-6">
              <h3 className="text-base font-semibold">{c.name}</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Explore {c.name.toLowerCase()} from our family.
              </p>
              <div className="mt-5">
                {c.slug === "skincare" ? (
                  <a
                    href={skincareUrl}
                    className="text-sm font-medium text-farm-800 hover:text-farm-900"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Browse {c.name} →
                  </a>
                ) : (
                  <Link
                    href={`/products/${c.slug}`}
                    className="text-sm font-medium text-farm-800 hover:text-farm-900"
                  >
                    Browse {c.name} →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {catalog.recipes.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Farm Recipes
              </h2>
              <p className="mt-2 text-sm text-zinc-700">
                Delicious ways to use our farm-fresh ingredients.
              </p>
            </div>
            <ButtonLink href="/recipes" variant="secondary" className="shrink-0">
              See all recipes
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.recipes.slice(0, 3).map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  <div className="relative h-40 w-full">
                    <Image
                      src={recipe.imagePath || "/photos/background.jpg"}
                      alt={recipe.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-farm-700">
                      {recipe.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                      {recipe.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
