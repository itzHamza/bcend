FROM ubuntu:22.04

# Add retry logic to apt-get commands and use better mirrors
RUN echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80retries \
    && echo 'APT::Install-Recommends "false";' > /etc/apt/apt.conf.d/90recommends \
    && echo 'APT::Install-Suggests "false";' > /etc/apt/apt.conf.d/90suggests

# Install basic dependencies with retry mechanism
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get update -y || (sleep 2 && apt-get update -y) || (sleep 5 && apt-get update -y) \
    && apt-get install -y \
    build-essential \
    cmake \
    libfreetype6-dev \
    libpng-dev \
    libjpeg-dev \
    libfontconfig1-dev \
    pkg-config \
    python3-dev \
    libpoppler-glib-dev \
    libpoppler-private-dev \
    libspiro-dev \
    libcairo2-dev \
    liblcms2-dev \
    libgif-dev \
    libpango1.0-dev \
    libopenjp2-7-dev \
    default-jre \
    gnupg \
    wget \
    curl \
    git \
    software-properties-common \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Build and install pdf2htmlEX from source with retry mechanism
RUN apt-get update -y || (sleep 2 && apt-get update -y) || (sleep 5 && apt-get update -y) \
    && apt-get install -y \
    python3-pip \
    && pip3 install pybind11 \
    && git clone --recursive https://github.com/pdf2htmlEX/pdf2htmlEX.git \
    && cd pdf2htmlEX \
    && mkdir build \
    && cd build \
    && cmake .. \
    && make \
    && make install \
    && cd / \
    && rm -rf pdf2htmlEX \
    && ldconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN apt-get update -y || (sleep 2 && apt-get update -y) || (sleep 5 && apt-get update -y) \
    && apt-get install -y ca-certificates \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update -y || (sleep 2 && apt-get update -y) || (sleep 5 && apt-get update -y) \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Create directories for uploads and output
RUN mkdir -p uploads output

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]