@echo off
setlocal

:: Store the token from registration
set TOKEN=c4b1b49b2f8fe0566ad70710c6643778d23ea840

:: 1. Create a client
echo Testing client creation...
curl -X POST http://127.0.0.1:8000/api/clients/register/ ^
-H "Authorization: Token %TOKEN%" ^
-H "Content-Type: application/json" ^
-d "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"date_of_birth\":\"1990-01-01\",\"gender\":\"M\",\"address\":\"123 Test St\",\"phone_number\":\"1234567890\",\"email\":\"john@example.com\"}"
echo.

:: 2. Create a health program
echo Testing program creation...
curl -X POST http://127.0.0.1:8000/api/programs/create/ ^
-H "Authorization: Token %TOKEN%" ^
-H "Content-Type: application/json" ^
-d "{\"name\":\"Test Program\",\"description\":\"A test health program\"}"
echo.

:: 3. Create a prescription
echo Testing prescription creation...
curl -X POST http://127.0.0.1:8000/api/prescriptions/create/ ^
-H "Authorization: Token %TOKEN%" ^
-H "Content-Type: application/json" ^
-d "{\"client_id\":1,\"medication_name\":\"Test Med\",\"dosage\":\"10mg\",\"frequency\":\"daily\",\"start_date\":\"2024-04-27\",\"notes\":\"Test prescription\"}"
echo.

:: 4. Record a metric
echo Testing metric recording...
curl -X POST http://127.0.0.1:8000/api/metrics/record/ ^
-H "Authorization: Token %TOKEN%" ^
-H "Content-Type: application/json" ^
-d "{\"client_id\":1,\"name\":\"Blood Pressure\",\"value\":\"120/80\",\"unit\":\"mmHg\"}"
echo.

:: 5. Create an appointment
echo Testing appointment creation...
curl -X POST http://127.0.0.1:8000/api/appointments/create/ ^
-H "Authorization: Token %TOKEN%" ^
-H "Content-Type: application/json" ^
-d "{\"client_id\":1,\"scheduled_with_id\":1,\"scheduled_for\":\"2024-05-01T10:00:00Z\",\"reason\":\"Regular checkup\",\"notes\":\"First appointment\"}"
echo.

:: 6. Test GET endpoints
echo Testing GET endpoints...

echo Getting clients list...
curl -X GET http://127.0.0.1:8000/api/clients/ ^
-H "Authorization: Token %TOKEN%"
echo.

echo Getting programs list...
curl -X GET http://127.0.0.1:8000/api/programs/ ^
-H "Authorization: Token %TOKEN%"
echo.

echo Getting enrollments list...
curl -X GET http://127.0.0.1:8000/api/enrollments/ ^
-H "Authorization: Token %TOKEN%"
echo.

echo Getting prescriptions list...
curl -X GET http://127.0.0.1:8000/api/prescriptions/ ^
-H "Authorization: Token %TOKEN%"
echo.

echo Getting metrics list...
curl -X GET http://127.0.0.1:8000/api/metrics/ ^
-H "Authorization: Token %TOKEN%"
echo.

echo Getting appointments list...
curl -X GET http://127.0.0.1:8000/api/appointments/ ^
-H "Authorization: Token %TOKEN%"
echo.

:: 7. Test report generation
echo Testing report generation...
curl -X GET "http://127.0.0.1:8000/api/reports/?type=client_attendance" ^
-H "Authorization: Token %TOKEN%"
echo.

:: 8. Test user settings
echo Testing user settings...
curl -X GET http://127.0.0.1:8000/api/settings/ ^
-H "Authorization: Token %TOKEN%"
echo.

:: 9. Test program metrics
echo Testing program metrics...
curl -X GET http://127.0.0.1:8000/api/program-metrics/ ^
-H "Authorization: Token %TOKEN%"
echo.

:: 10. Test resource utilization
echo Testing resource utilization...
curl -X GET http://127.0.0.1:8000/api/resource-utilization/ ^
-H "Authorization: Token %TOKEN%"
echo.

endlocal 