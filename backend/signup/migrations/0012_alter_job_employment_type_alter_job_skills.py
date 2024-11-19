# Generated by Django 5.0.6 on 2024-11-13 18:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('signup', '0011_remove_job_company_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='employment_type',
            field=models.CharField(choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract'), ('temporary', 'Temporary'), ('internship', 'Internship')], max_length=10),
        ),
        migrations.AlterField(
            model_name='job',
            name='skills',
            field=models.CharField(choices=[('front_end', 'Front-end'), ('back_end', 'Back-end'), ('full_stack', 'Full Stack'), ('app_development', 'App Development'), ('db_administrator', 'DB Administrator')], max_length=20),
        ),
    ]
