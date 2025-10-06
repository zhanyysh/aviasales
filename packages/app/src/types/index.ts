export interface Flight {
    id: number;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    base_price: string;
    seats_available: number;
    departure_airport_name: string;
    departure_city: string;
    departure_iata: string;
    arrival_airport_name: string;
    arrival_city: string;
    arrival_iata: string;
    airline_name: string;
    airline_iata: string;
    stops?: number;
}

export interface Booking {
    flight_id: number;
    // Добавьте остальные поля Booking, если они используются в проекте
}
