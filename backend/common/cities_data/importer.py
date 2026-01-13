import csv


def data():

     with open("cities.csv", "r", newline="") as cities_file:
        reader = csv.reader(cities_file)
        count = 0
        for row in reader:
            country_name = row[7]
            city_name = row[1]

            print(city_name, " ", country_name)

            count += 1

            if count == 10:
                break

            # country = Country.objects.get(iso_code=country_iso_code)
            # City.objects.get_or_create(name=name, country=country)

data()
