from bs4 import BeautifulSoup
import requests
from playwright.sync_api import sync_playwright
from datetime import datetime


# TODO setup a logger
def get_energa_planned_shutdowns() -> dict[str, dict[str, dict[str, tuple[datetime, datetime]]]]:
    """
        oddzial:
            - region:
                - gmina:
                    - ulica i nr. domu : (start_date, end_date)
                    - ulica i nr. domu : (start_date, end_date)
    """
    url = "https://energa-operator.pl/uslugi/awarie-i-wylaczenia/wylaczenia-planowane"

    oddziale = {}

    try:
        # Session-based approach because the website uses CSR with hydration :0
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url)

            accordion_css_selector = 'div.accordion-item'
            # Wait for content to load
            page.wait_for_selector(accordion_css_selector)

            html = page.content()
            browser.close()

        soup = BeautifulSoup(html, 'lxml')

        oddziale_selectors = soup.select(accordion_css_selector)

        for i, oddzial in enumerate(oddziale_selectors):
            oddzial_name = oddzial.find_next('button').text.strip()
            print(oddzial_name)

            region_containers = oddzial.find_all('div', class_='breakdown__region')

            for region in region_containers:
                region_name = region.find_next('h3', class_='breakdown__region-name').text.strip()
                print("\t" + region_name)

                area_divs = region.find_all('div', class_='breakdown__area')

                for area_div in area_divs:
                    gmina_name = area_div.find('h4', class_='breakdown__area-name').text.strip()
                    print("\t\t" + gmina_name)

        # print(soup)

    except Exception as error:
        print(error)

    return oddziale


if __name__ == '__main__':
    get_energa_planned_shutdowns()
