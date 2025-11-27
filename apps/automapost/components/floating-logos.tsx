'use client'

import { useState, useEffect, useRef } from 'react'
import { featureFlags } from '@/lib/feature-flags'

// Company logos data - using SVG icons for popular companies
const companyLogos = [
  {
    name: 'Microsoft',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#00BCF2" d="M11.4 24H0V12.6h11.4V24z"/>
        <path fill="#00BCF2" d="M24 24H12.6V12.6H24V24z"/>
        <path fill="#00BCF2" d="M11.4 11.4H0V0h11.4v11.4z"/>
        <path fill="#00BCF2" d="M24 11.4H12.6V0H24v11.4z"/>
      </svg>
    )
  },
  {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )
  },
  {
    name: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
        <path fill="#000" d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
      </svg>
    )
  },
  {
    name: 'Amazon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.548.41-3.14.615-4.777.615-3.909 0-7.375-1.002-10.395-3.006-.657-.434-1.234-.808-1.729-1.12-.494-.31-.884-.677-1.17-1.1-.287-.424-.392-.796-.317-1.116.076-.32.27-.548.58-.683.31-.135.672-.162 1.087-.08.415.08.944.252 1.587.512z"/>
        <path fill="#146EB4" d="M16.68 8.052c.476 1.07.237 1.898-.719 2.484-.956.586-2.22.879-3.79.879-.653 0-1.277-.062-1.873-.185-.596-.123-1.164-.308-1.703-.554-.54-.246-1.052-.554-1.537-.924-.485-.37-.943-.801-1.375-1.293-.432-.492-.839-1.044-1.22-1.655-.38-.611-.735-1.282-1.064-2.013-.33-.731-.634-1.523-.914-2.375-.28-.852-.534-1.765-.763-2.74-.229-.975-.433-2.012-.612-3.11-.179-1.098-.333-2.258-.462-3.48C1.654.116 1 0 1 0h2.525c.176 0 .298.086.366.258.068.172.102.38.102.624 0 .244.034.523.102.837.068.314.153.663.255 1.047.102.384.221.803.357 1.256.136.453.289.94.459 1.46.17.52.357 1.073.561 1.659.204.586.425 1.204.663 1.854.238.65.493 1.331.765 2.043.272.712.561 1.456.867 2.232.306.776.629 1.584.969 2.424.34.84.697 1.712 1.071 2.616.374.904.765 1.84 1.173 2.808.408.968.833 1.968 1.275 3 .442 1.032.901 2.096 1.377 3.192.476 1.096.969 2.224 1.479 3.384.51 1.16 1.037 2.352 1.581 3.576.544 1.224 1.105 2.48 1.683 3.768.578 1.288 1.173 2.608 1.785 3.96.612 1.352 1.241 2.736 1.887 4.152.646 1.416 1.309 2.864 1.989 4.344.68 1.48 1.377 2.992 2.091 4.536.714 1.544 1.445 3.12 2.193 4.728.748 1.608 1.513 3.248 2.295 4.92.782 1.672 1.581 3.376 2.397 5.112.816 1.736 1.649 3.504 2.499 5.304.85 1.8 1.717 3.632 2.601 5.496.884 1.864 1.785 3.76 2.703 5.688.918 1.928 1.853 3.888 2.805 5.88.952 1.992 1.921 4.016 2.907 6.072.986 2.056 1.989 4.144 3.009 6.264 1.02 2.12 2.057 4.272 3.111 6.456 1.054 2.184 2.125 4.4 3.213 6.648 1.088 2.248 2.193 4.528 3.315 6.84 1.122 2.312 2.261 4.656 3.417 7.032 1.156 2.376 2.329 4.784 3.519 7.224 1.19 2.44 2.397 4.912 3.621 7.416 1.224 2.504 2.465 5.04 3.723 7.608 1.258 2.568 2.533 5.168 3.825 7.8 1.292 2.632 2.601 5.296 3.927 7.992 1.326 2.696 2.669 5.424 4.029 8.184 1.36 2.76 2.737 5.552 4.131 8.376 1.394 2.824 2.805 5.68 4.233 8.568 1.428 2.888 2.873 5.808 4.335 8.76 1.462 2.952 2.941 5.936 4.437 8.952 1.496 3.016 3.009 6.064 4.539 9.144 1.53 3.08 3.077 6.192 4.641 9.336 1.564 3.144 3.145 6.32 4.743 9.528 1.598 3.208 3.213 6.448 4.845 9.72 1.632 3.272 3.281 6.576 4.947 9.912 1.666 3.336 3.349 6.704 5.049 10.104 1.7 3.4 3.417 6.832 5.151 10.296 1.734 3.464 3.485 6.96 5.253 10.488 1.768 3.528 3.553 7.088 5.355 10.68 1.802 3.592 3.621 7.216 5.457 10.872 1.836 3.656 3.689 7.344 5.559 11.064 1.87 3.72 3.757 7.472 5.661 11.256 1.904 3.784 3.825 7.6 5.763 11.448 1.938 3.848 3.893 7.728 5.865 11.64 1.972 3.912 3.961 7.856 5.967 11.832 2.006 3.976 4.029 7.984 6.069 12.024 2.04 4.04 4.097 8.112 6.171 12.216 2.074 4.104 4.165 8.24 6.273 12.408 2.108 4.168 4.233 8.368 6.375 12.6 2.142 4.232 4.301 8.496 6.477 12.792 2.176 4.296 4.369 8.624 6.579 12.984 2.21 4.36 4.437 8.752 6.681 13.176 2.244 4.424 4.505 8.88 6.783 13.368 2.278 4.488 4.573 8.008 6.885 13.56"/>
      </svg>
    )
  },
  {
    name: 'Netflix',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.71.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
      </svg>
    )
  },
  {
    name: 'Slack',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
        <path fill="#E01E5A" d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
        <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"/>
        <path fill="#36C5F0" d="M8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
        <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z"/>
        <path fill="#2EB67D" d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
        <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z"/>
        <path fill="#ECB22E" d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    )
  },
  {
    name: 'Spotify',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#1ED760" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#0077B5" fillRule="evenodd" d="M18.338 18.338H15.67v-4.177c0-.997-.018-2.278-1.387-2.278-1.39 0-1.602 1.085-1.602 2.206v4.25h-2.668v-8.59h2.561v1.173h.036c.356-.675 1.227-1.388 2.526-1.388 2.703 0 3.202 1.78 3.202 4.092v4.712ZM7.004 8.574a1.548 1.548 0 1 1 0-3.097 1.548 1.548 0 0 1 0 3.097ZM5.67 18.338h2.67v-8.59h-2.67v8.59ZM19.668 3H4.328C3.597 3 3 3.581 3 4.297v15.404C3 20.418 3.596 21 4.329 21h15.339c.734 0 1.332-.582 1.332-1.299V4.297C21 3.581 20.402 3 19.668 3Z"/>
      </svg>
    )
  }
]

// Social media logos data - alternative set for the feature flag
const socialMediaLogos = [
  {
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        <defs>
          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#833AB4"/>
            <stop offset="50%" stopColor="#FD1D1D"/>
            <stop offset="100%" stopColor="#FCB045"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    name: 'Amazon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.548.41-3.14.615-4.777.615-3.909 0-7.375-1.002-10.395-3.006-.657-.434-1.234-.808-1.729-1.12-.494-.31-.884-.677-1.17-1.1-.287-.424-.392-.796-.317-1.116.076-.32.27-.548.58-.683.31-.135.672-.162 1.087-.08.415.08.944.252 1.587.512z"/>
        <path fill="#146EB4" d="M16.68 8.052c.476 1.07.237 1.898-.719 2.484-.956.586-2.22.879-3.79.879-.653 0-1.277-.062-1.873-.185-.596-.123-1.164-.308-1.703-.554-.54-.246-1.052-.554-1.537-.924-.485-.37-.943-.801-1.375-1.293-.432-.492-.839-1.044-1.22-1.655-.38-.611-.735-1.282-1.064-2.013-.33-.731-.634-1.523-.914-2.375-.28-.852-.534-1.765-.763-2.74-.229-.975-.433-2.012-.612-3.11-.179-1.098-.333-2.258-.462-3.48C1.654.116 1 0 1 0h2.525c.176 0 .298.086.366.258.068.172.102.38.102.624 0 .244.034.523.102.837.068.314.153.663.255 1.047.102.384.221.803.357 1.256.136.453.289.94.459 1.46.17.52.357 1.073.561 1.659.204.586.425 1.204.663 1.854.238.65.493 1.331.765 2.043.272.712.561 1.456.867 2.232.306.776.629 1.584.969 2.424.34.84.697 1.712 1.071 2.616.374.904.765 1.84 1.173 2.808.408.968.833 1.968 1.275 3 .442 1.032.901 2.096 1.377 3.192.476 1.096.969 2.224 1.479 3.384.51 1.16 1.037 2.352 1.581 3.576.544 1.224 1.105 2.48 1.683 3.768.578 1.288 1.173 2.608 1.785 3.96.612 1.352 1.241 2.736 1.887 4.152.646 1.416 1.309 2.864 1.989 4.344.68 1.48 1.377 2.992 2.091 4.536.714 1.544 1.445 3.12 2.193 4.728.748 1.608 1.513 3.248 2.295 4.92.782 1.672 1.581 3.376 2.397 5.112.816 1.736 1.649 3.504 2.499 5.304.85 1.8 1.717 3.632 2.601 5.496.884 1.864 1.785 3.76 2.703 5.688.918 1.928 1.853 3.888 2.805 5.88.952 1.992 1.921 4.016 2.907 6.072.986 2.056 1.989 4.144 3.009 6.264 1.02 2.12 2.057 4.272 3.111 6.456 1.054 2.184 2.125 4.4 3.213 6.648 1.088 2.248 2.193 4.528 3.315 6.84 1.122 2.312 2.261 4.656 3.417 7.032 1.156 2.376 2.329 4.784 3.519 7.224 1.19 2.44 2.397 4.912 3.621 7.416 1.224 2.504 2.465 5.04 3.723 7.608 1.258 2.568 2.533 5.168 3.825 7.8 1.292 2.632 2.601 5.296 3.927 7.992 1.326 2.696 2.669 5.424 4.029 8.184 1.36 2.76 2.737 5.552 4.131 8.376 1.394 2.824 2.805 5.68 4.233 8.568 1.428 2.888 2.873 5.808 4.335 8.76 1.462 2.952 2.941 5.936 4.437 8.952 1.496 3.016 3.009 6.064 4.539 9.144 1.53 3.08 3.077 6.192 4.641 9.336 1.564 3.144 3.145 6.32 4.743 9.528 1.598 3.208 3.213 6.448 4.845 9.72 1.632 3.272 3.281 6.576 4.947 9.912 1.666 3.336 3.349 6.704 5.049 10.104 1.7 3.4 3.417 6.832 5.151 10.296 1.734 3.464 3.485 6.96 5.253 10.488 1.768 3.528 3.553 7.088 5.355 10.68 1.802 3.592 3.621 7.216 5.457 10.872 1.836 3.656 3.689 7.344 5.559 11.064 1.87 3.72 3.757 7.472 5.661 11.256 1.904 3.784 3.825 7.6 5.763 11.448 1.938 3.848 3.893 7.728 5.865 11.64 1.972 3.912 3.961 7.856 5.967 11.832 2.006 3.976 4.029 7.984 6.069 12.024 2.04 4.04 4.097 8.112 6.171 12.216 2.074 4.104 4.165 8.24 6.273 12.408 2.108 4.168 4.233 8.368 6.375 12.6 2.142 4.232 4.301 8.496 6.477 12.792 2.176 4.296 4.369 8.624 6.579 12.984 2.21 4.36 4.437 8.752 6.681 13.176 2.244 4.424 4.505 8.88 6.783 13.368 2.278 4.488 4.573 8.008 6.885 13.56"/>
      </svg>
    )
  },
  {
    name: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#000000" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )
  },
  {
    name: 'Bluesky',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#1185fe" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.296 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
      </svg>
    )
  },
  {
    name: 'X (Twitter)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#000000" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#0077B5" fillRule="evenodd" d="M18.338 18.338H15.67v-4.177c0-.997-.018-2.278-1.387-2.278-1.39 0-1.602 1.085-1.602 2.206v4.25h-2.668v-8.59h2.561v1.173h.036c.356-.675 1.227-1.388 2.526-1.388 2.703 0 3.202 1.78 3.202 4.092v4.712ZM7.004 8.574a1.548 1.548 0 1 1 0-3.097 1.548 1.548 0 0 1 0 3.097ZM5.67 18.338h2.67v-8.59h-2.67v8.59ZM19.668 3H4.328C3.597 3 3 3.581 3 4.297v15.404C3 20.418 3.596 21 4.329 21h15.339c.734 0 1.332-.582 1.332-1.299V4.297C21 3.581 20.402 3 19.668 3Z"/>
      </svg>
    )
  }
]

interface LogoPosition {
  x: number
  y: number
  initialX: number
  initialY: number
  velocityX: number
  velocityY: number
}

interface FloatingLogosProps {
  isPostHovered?: boolean
}

export default function FloatingLogos({ isPostHovered = false }: FloatingLogosProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [logoPositions, setLogoPositions] = useState<LogoPosition[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)
  
  // Choose logo set based on feature flag
  const currentLogos = featureFlags.useSocialMediaLogos ? socialMediaLogos : companyLogos

  // Initialize logo positions - fixed positions on the right side
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    
    // Fixed position percentages for each logo (relative to container)
    // These positions are designed to look natural and well-distributed
    const fixedPositions = [
      { xPercent: 0.65, yPercent: 0.15 }, // Microsoft - top right
      { xPercent: 0.85, yPercent: 0.25 }, // Google - upper right
      { xPercent: 0.75, yPercent: 0.28 }, // Apple - middle right
      { xPercent: 0.55, yPercent: 0.45 }, // Amazon - center
      { xPercent: 0.90, yPercent: 0.55 }, // Netflix - lower right
      { xPercent: 0.68, yPercent: 0.75 }, // Slack - lower center
      { xPercent: 0.80, yPercent: 0.75 }, // Spotify - bottom right
      { xPercent: 0.58, yPercent: 0.80 }  // LinkedIn - bottom center
    ]
    
    const positions: LogoPosition[] = currentLogos.map((_, index) => {
      const fixedPos = fixedPositions[index]
      
      // Calculate actual pixel positions from percentages
      const x = containerRect.width * fixedPos.xPercent
      const y = containerRect.height * fixedPos.yPercent
      
      return {
        x,
        y,
        initialX: x,
        initialY: y,
        velocityX: 0,
        velocityY: 0
      }
    })
    
    setLogoPositions(positions)
  }, [])

  // Mouse tracking
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 } // Move mouse far away
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setLogoPositions(prevPositions => {
        return prevPositions.map(pos => {
          const mouse = mouseRef.current
          
          // Calculate distance from mouse
          const dx = mouse.x - pos.x
          const dy = mouse.y - pos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Water-like attraction force (gentle pull towards mouse when nearby)
          const attractionRadius = 150
          const maxAttraction = 15 // Maximum pixels a logo can move toward mouse
          let attractionX = 0
          let attractionY = 0
          
          if (distance < attractionRadius && distance > 0 && mouse.x > 0 && mouse.y > 0) {
            // Calculate attraction strength (stronger when closer, but capped)
            const attractionStrength = Math.min(
              (attractionRadius - distance) / attractionRadius * 0.3,
              maxAttraction / distance
            )
            
            // Direction towards mouse (normalized)
            const directionX = dx / distance
            const directionY = dy / distance
            
            // Apply gentle attraction force
            attractionX = directionX * attractionStrength * maxAttraction
            attractionY = directionY * attractionStrength * maxAttraction
          }
          
          // Post hover attraction (pull logos toward the post area when hovered)
          let postAttractionX = 0
          let postAttractionY = 0
          
          if (isPostHovered && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            // Post is roughly in the right side center area (around 75% width, 50% height)
            const postCenterX = containerRect.width * 0.75
            const postCenterY = containerRect.height * 0.50
            
            // Calculate direction toward post center
            const postDx = postCenterX - pos.x
            const postDy = postCenterY - pos.y
            const postDistance = Math.sqrt(postDx * postDx + postDy * postDy)
            
            if (postDistance > 0) {
              // Move logos 20-30 pixels toward the post
              const postAttractionStrength = 25
              postAttractionX = (postDx / postDistance) * postAttractionStrength
              postAttractionY = (postDy / postDistance) * postAttractionStrength
            }
          }
          
          // Calculate target position (original + mouse attraction + post attraction)
          const targetX = pos.initialX + attractionX + postAttractionX
          const targetY = pos.initialY + attractionY + postAttractionY
          
          // Spring force towards target position (smooth movement)
          const springForce = 0.08
          const springX = (targetX - pos.x) * springForce
          const springY = (targetY - pos.y) * springForce
          
          // Update velocity with spring force and damping
          const damping = 0.85
          const newVelocityX = (pos.velocityX + springX) * damping
          const newVelocityY = (pos.velocityY + springY) * damping
          
          // Update position
          const newX = pos.x + newVelocityX
          const newY = pos.y + newVelocityY
          
          return {
            ...pos,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY
          }
        })
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPostHovered])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 5 }}
    >
      {logoPositions.map((position, index) => (
        <div
          key={currentLogos[index].name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 hover:opacity-80"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 6
          }}
          role="img"
          aria-label={`${currentLogos[index].name} logo`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
            <div className="opacity-60 hover:opacity-80 transition-opacity" aria-hidden="true">
              {currentLogos[index].icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}