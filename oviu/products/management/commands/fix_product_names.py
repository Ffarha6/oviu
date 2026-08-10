from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = "يصلح المنتجات اللي اتخزن اسمها/وصفها غلط في name_en بدل name_ar بسبب بج اللغة القديم"

    def handle(self, *args, **options):
        fields = ['name', 'description', 'meta_title', 'meta_description']
        fixed_count = 0

        for p in Product.objects.all():
            changed = False
            update_fields = []

            for f in fields:
                ar_field = f'{f}_ar'
                en_field = f'{f}_en'

                ar_val = getattr(p, ar_field, None)
                en_val = getattr(p, en_field, None)

                if not ar_val and en_val:
                    setattr(p, ar_field, en_val)
                    changed = True
                    update_fields.append(ar_field)

            if changed:
                p.save(update_fields=update_fields)
                fixed_count += 1
                self.stdout.write(self.style.SUCCESS(f"✅ اتصلح المنتج id={p.id}"))

        self.stdout.write(self.style.SUCCESS(f"\nخلصنا. عدد المنتجات اللي اتصلحت: {fixed_count}"))
