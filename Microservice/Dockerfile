# Use the UV runtime image
FROM astral/uv:python3.13-bookworm-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y curl

# Create and set the working directory
WORKDIR /app

# Copy only UV files first (for caching)
COPY pyproject.toml uv.lock* /app/

# Install dependencies, uv will install dependencies using the exact versions specified in the uv.lock file, rather than resolving new versions based on the dependencies specified in pyproject.toml. But pyproject.toml is still needed
RUN uv sync --locked

# Copy the full project and bingX library
COPY . /app/

EXPOSE 8001

CMD ["sh", "-c", "uv run python manage.py migrate && uv run gunicorn Microservice.wsgi:application --bind 0.0.0.0:8001 --workers 1"]

